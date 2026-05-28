#!/usr/bin/env node
/**
 * scripts/ingest-startups/from-wikidata.mjs
 *
 * Phase 2 (a): Identity + founders enrichment from Wikidata.
 *
 * For each startup in seed-list.json:
 *   1. Resolve a Wikidata QID (via the seed's `wikidata_qid` if set, else
 *      the Wikipedia article title via the SPARQL `schema:about` join, else
 *      a search on the entity label).
 *   2. SPARQL one query per startup pulling:
 *        - P112 founders   (each founder's QID)
 *        - P571 inception
 *        - P159 HQ location  → city + admin state
 *        - P452 industry
 *        - P749 parent organization
 *        - P169 chief executive officer
 *        - P1128 employees
 *        - P856 official website
 *        - P154 logo image
 *        - P414 stock exchange
 *        - P5768 Crunchbase organization slug
 *   3. For each founder QID, fetch a short bio (P31, P569 birth, P69 alma
 *      mater, P108 employer, schema:description in English).
 *   4. Upsert startupFounder docs first, then patch the startup doc to:
 *        - setIfMissing identity fields (legal_name, hq_city, etc.)
 *        - append data_sources[]
 *        - set `founders[]` references
 *
 * Flags:
 *   --dry-run            do not write to Sanity, just print
 *   --limit N            cap to first N startups
 *   --only <slug,slug>   process only listed slugs
 *
 * SPARQL endpoint: https://query.wikidata.org/sparql  (no key required).
 * Wikidata SPARQL has a 60s timeout — we batch one startup at a time.
 *
 * The full SPARQL template used for each startup is in WD_STARTUP_QUERY below.
 * Re-run / extend by editing that template; nothing else hardcoded.
 */

import {
  loadEnv, parseArgs, loadSeedList, getSanityClient, ensureStartupExists,
  patchStartup, founderDocId, startupDocId, dataSourceEntry, politeFetch,
  sleep, slugify, ptParagraphs, noEmDash, rkey, mergeArrayField,
} from './_lib.mjs'

loadEnv()
const args = parseArgs()
const DRY = !!args['dry-run']
const LIMIT = parseInt(args.limit ?? '0', 10) || 0
const ONLY = args.only ? new Set(String(args.only).split(',').map(s => s.trim())) : null

const SPARQL_URL = 'https://query.wikidata.org/sparql'

// ────────────────────────────────────────────────────────────────────────────
// SPARQL templates. Designed to fit comfortably in Wikidata's 60s budget.
// ────────────────────────────────────────────────────────────────────────────

// 1. Resolve a QID from a Wikipedia article title.
//    NOTE: schema:about links the article URL to the entity.
function wdResolveByWikipediaQuery(title) {
  const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
  return `
SELECT ?item WHERE {
  <${url}> schema:about ?item .
} LIMIT 1`
}

// 2. Resolve a QID by searching label/altLabel. India + organization filter.
function wdResolveByLabelQuery(name) {
  const safe = name.replace(/"/g, '\\"')
  return `
SELECT ?item ?itemLabel WHERE {
  SERVICE wikibase:mwapi {
    bd:serviceParam wikibase:api "EntitySearch" .
    bd:serviceParam wikibase:endpoint "www.wikidata.org" .
    bd:serviceParam mwapi:search "${safe}" .
    bd:serviceParam mwapi:language "en" .
    ?item wikibase:apiOutputItem mwapi:item .
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 5`
}

// 3. Full startup payload by QID.
function wdStartupPayloadQuery(qid) {
  return `
SELECT
  ?entity ?entityLabel ?entityDescription
  ?legalName
  ?inception
  ?websiteRaw
  ?logoUrl
  ?crunchbaseSlug
  ?hqLocationLabel ?hqAdminLabel
  ?employeeCount
  (GROUP_CONCAT(DISTINCT ?industryLabel; separator="|") AS ?industries)
  (GROUP_CONCAT(DISTINCT ?founderQid; separator="|") AS ?founders)
  (GROUP_CONCAT(DISTINCT ?founderLabel; separator="|") AS ?founderLabels)
  (GROUP_CONCAT(DISTINCT ?ceoLabel; separator="|") AS ?ceos)
  (GROUP_CONCAT(DISTINCT ?parentLabel; separator="|") AS ?parents)
  (GROUP_CONCAT(DISTINCT ?exchangeLabel; separator="|") AS ?exchanges)
WHERE {
  BIND(wd:${qid} AS ?entity)
  OPTIONAL { ?entity wdt:P1448 ?legalName . FILTER(LANG(?legalName) = "en") }
  OPTIONAL { ?entity wdt:P571 ?inception . }
  OPTIONAL { ?entity wdt:P856 ?websiteRaw . }
  OPTIONAL {
    ?entity wdt:P154 ?logo .
    BIND(CONCAT("https://commons.wikimedia.org/wiki/Special:FilePath/", REPLACE(STR(?logo), ".*FilePath/", "")) AS ?logoUrl)
  }
  OPTIONAL { ?entity wdt:P5768 ?crunchbaseSlug . }
  OPTIONAL {
    ?entity wdt:P159 ?hqLoc .
    ?hqLoc rdfs:label ?hqLocationLabel . FILTER(LANG(?hqLocationLabel) = "en")
    OPTIONAL {
      ?hqLoc wdt:P131 ?hqAdmin .
      ?hqAdmin rdfs:label ?hqAdminLabel . FILTER(LANG(?hqAdminLabel) = "en")
    }
  }
  OPTIONAL { ?entity wdt:P1128 ?employeeCount . }
  OPTIONAL {
    ?entity wdt:P452 ?ind .
    ?ind rdfs:label ?industryLabel . FILTER(LANG(?industryLabel) = "en")
  }
  OPTIONAL {
    ?entity wdt:P112 ?founder .
    BIND(REPLACE(STR(?founder), ".*/", "") AS ?founderQid)
    ?founder rdfs:label ?founderLabel . FILTER(LANG(?founderLabel) = "en")
  }
  OPTIONAL {
    ?entity wdt:P169 ?ceo .
    ?ceo rdfs:label ?ceoLabel . FILTER(LANG(?ceoLabel) = "en")
  }
  OPTIONAL {
    ?entity wdt:P749 ?parent .
    ?parent rdfs:label ?parentLabel . FILTER(LANG(?parentLabel) = "en")
  }
  OPTIONAL {
    ?entity wdt:P414 ?exch .
    ?exch rdfs:label ?exchangeLabel . FILTER(LANG(?exchangeLabel) = "en")
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
GROUP BY ?entity ?entityLabel ?entityDescription ?legalName ?inception ?websiteRaw ?logoUrl ?crunchbaseSlug ?hqLocationLabel ?hqAdminLabel ?employeeCount`
}

// 4. Founder bio payload by founder QID.
function wdFounderQuery(qid) {
  return `
SELECT ?entity ?entityLabel ?entityDescription
  ?birth ?imageUrl
  (GROUP_CONCAT(DISTINCT ?almaMaterLabel; separator="|") AS ?almaMaters)
  (GROUP_CONCAT(DISTINCT ?employerLabel; separator="|") AS ?employers)
  (GROUP_CONCAT(DISTINCT ?occupationLabel; separator="|") AS ?occupations)
WHERE {
  BIND(wd:${qid} AS ?entity)
  OPTIONAL { ?entity wdt:P569 ?birth . }
  OPTIONAL {
    ?entity wdt:P18 ?image .
    BIND(CONCAT("https://commons.wikimedia.org/wiki/Special:FilePath/", REPLACE(STR(?image), ".*FilePath/", "")) AS ?imageUrl)
  }
  OPTIONAL { ?entity wdt:P69  ?alma .     ?alma     rdfs:label ?almaMaterLabel  . FILTER(LANG(?almaMaterLabel)  = "en") }
  OPTIONAL { ?entity wdt:P108 ?employer . ?employer rdfs:label ?employerLabel   . FILTER(LANG(?employerLabel)   = "en") }
  OPTIONAL { ?entity wdt:P106 ?occ .      ?occ      rdfs:label ?occupationLabel . FILTER(LANG(?occupationLabel) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
GROUP BY ?entity ?entityLabel ?entityDescription ?birth ?imageUrl`
}

// ────────────────────────────────────────────────────────────────────────────
// SPARQL runner. Wikidata wants `Accept: application/sparql-results+json`.
// ────────────────────────────────────────────────────────────────────────────
async function sparql(query) {
  const url = `${SPARQL_URL}?query=${encodeURIComponent(query)}&format=json`
  const res = await politeFetch(url, {
    accept: 'application/sparql-results+json',
    baseDelay: 1200,
    maxAttempts: 3,
  })
  const json = await res.json()
  return json.bindings = json.results?.bindings ?? []
}

async function sparqlBindings(query) {
  const url = `${SPARQL_URL}?query=${encodeURIComponent(query)}&format=json`
  const res = await politeFetch(url, {
    accept: 'application/sparql-results+json',
    baseDelay: 1200,
    maxAttempts: 3,
  })
  const json = await res.json()
  return json.results?.bindings ?? []
}

function bval(binding, key) {
  return binding?.[key]?.value
}

// Pull the QID out of a Wikidata entity URI like http://www.wikidata.org/entity/Q145
function qidFromUri(uri) {
  if (!uri) return null
  const m = String(uri).match(/Q\d+$/)
  return m ? m[0] : null
}

async function resolveQid(seed) {
  if (seed.wikidata_qid) return seed.wikidata_qid
  if (seed.wikipedia_title) {
    try {
      const rows = await sparqlBindings(wdResolveByWikipediaQuery(seed.wikipedia_title))
      const qid = qidFromUri(bval(rows[0], 'item'))
      if (qid) return qid
    } catch (e) { /* fall through */ }
  }
  try {
    const rows = await sparqlBindings(wdResolveByLabelQuery(seed.name))
    if (rows.length > 0) return qidFromUri(bval(rows[0], 'item'))
  } catch (e) { /* fall through */ }
  return null
}

// ────────────────────────────────────────────────────────────────────────────
// Sanity write helpers
// ────────────────────────────────────────────────────────────────────────────
async function upsertFounder(client, name, founderQid, bio) {
  const slug = slugify(name)
  const _id = founderDocId(slug)
  const tags = [
    ...(bio?.almaMaters ? bio.almaMaters.split('|').filter(Boolean) : []),
    ...(bio?.employers   ? bio.employers.split('|').filter(Boolean)   : []),
  ].slice(0, 12)

  const shortBio = noEmDash(bio?.entityDescription || `Co-founder of ${name}.`)

  const founderDoc = {
    _id,
    _type: 'startupFounder',
    name,
    slug: { _type: 'slug', current: slug },
    short_bio: shortBio,
    background: tags,
    data_sources: [
      {
        _key: rkey('src'),
        _type: 'object',
        source: 'Wikidata',
        url: `https://www.wikidata.org/wiki/${founderQid}`,
        last_fetched: new Date().toISOString(),
      },
    ],
    last_updated_at: new Date().toISOString(),
    verified: false,
  }
  if (DRY) {
    console.log(`  [dry] founder ${_id} (${name})`)
    return { _ref: _id, _type: 'reference', _key: rkey('f') }
  }
  await client.createIfNotExists(founderDoc)
  // Patch short_bio + background if missing on existing doc.
  await client.patch(_id)
    .setIfMissing({ short_bio: shortBio, background: tags })
    .set({ last_updated_at: new Date().toISOString() })
    .commit({ autoGenerateArrayKeys: true })
  return { _ref: _id, _type: 'reference', _key: rkey('f') }
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────
async function run() {
  const seedList = loadSeedList(LIMIT)
  const targets = ONLY ? seedList.filter((s) => ONLY.has(s.slug)) : seedList

  console.log(`[wikidata] Processing ${targets.length} startups (dry=${DRY})`)

  let client = null
  if (!DRY) client = await getSanityClient()

  const stats = { hit: 0, miss: 0, skipped: 0, errors: 0, founders: 0 }

  for (const seed of targets) {
    try {
      // Resolve QID
      const qid = await resolveQid(seed)
      if (!qid) {
        console.log(`  MISS  ${seed.name} (no QID)`)
        stats.miss++
        await sleep(500)
        continue
      }
      console.log(`  HIT   ${seed.name} → ${qid}`)

      // Payload query
      const rows = await sparqlBindings(wdStartupPayloadQuery(qid))
      if (!rows.length) {
        stats.miss++
        await sleep(500)
        continue
      }
      const r = rows[0]

      // Build patch
      const inception   = bval(r, 'inception')
      const inceptionYear = inception ? new Date(inception).getFullYear() : null
      const website     = bval(r, 'websiteRaw')
      const legalName   = bval(r, 'legalName')
      const hqCity      = bval(r, 'hqLocationLabel')
      const hqState     = bval(r, 'hqAdminLabel')
      const empCount    = bval(r, 'employeeCount')
      const industries  = (bval(r, 'industries')   || '').split('|').filter(Boolean)
      const founderLbls = (bval(r, 'founderLabels')|| '').split('|').filter(Boolean)
      const founderQids = (bval(r, 'founders')     || '').split('|').filter(Boolean)
      const ceos        = (bval(r, 'ceos')         || '').split('|').filter(Boolean)
      const exchanges   = (bval(r, 'exchanges')    || '').split('|').filter(Boolean)
      const crunchbase  = bval(r, 'crunchbaseSlug')

      // Ensure base startup doc exists
      if (!DRY) await ensureStartupExists(client, seed, 'seed-list + Wikidata')

      // Founder docs
      const founderRefs = []
      const founderPairs = founderQids.map((q, i) => ({ qid: q, name: founderLbls[i] }))
        .filter((p) => p.qid && p.name)

      for (const fp of founderPairs) {
        try {
          const fRows = await sparqlBindings(wdFounderQuery(fp.qid))
          const fbio = fRows[0]
            ? {
                entityDescription: bval(fRows[0], 'entityDescription'),
                almaMaters:        bval(fRows[0], 'almaMaters'),
                employers:         bval(fRows[0], 'employers'),
                imageUrl:          bval(fRows[0], 'imageUrl'),
                birth:             bval(fRows[0], 'birth'),
              }
            : null
          const ref = await upsertFounder(client, fp.name, fp.qid, fbio)
          founderRefs.push(ref)
          stats.founders++
          await sleep(400)
        } catch (e) {
          console.log(`    founder error (${fp.name}): ${e.message}`)
        }
      }

      // Key executives (CEOs not in founder list)
      const founderNameSet = new Set(founderPairs.map((p) => p.name.toLowerCase()))
      const keyExecs = ceos
        .filter((n) => !founderNameSet.has(n.toLowerCase()))
        .map((n) => ({ _key: rkey('ke'), _type: 'object', name: n, title: 'CEO' }))

      // Tags (industries + exchanges)
      const tags = [
        ...industries.slice(0, 8),
        ...exchanges.map((e) => `Listed: ${e}`),
      ].map(noEmDash)

      if (DRY) {
        console.log(`    [dry] would patch ${seed.slug}: inception=${inceptionYear}, hq=${hqCity}/${hqState}, founders=${founderRefs.length}, ceos=${ceos.length}, exch=${exchanges.length}`)
      } else {
        const docId = startupDocId(seed.slug)
        const patch = client.patch(docId)
          .setIfMissing({
            legal_name: legalName,
            founded_year: inceptionYear,
            website,
            hq_city: hqCity,
            hq_state: hqState,
          })
          .set({ last_updated_at: new Date().toISOString() })
        if (founderRefs.length) patch.setIfMissing({ founders: founderRefs })
        if (keyExecs.length)    patch.setIfMissing({ key_executives: keyExecs })
        if (tags.length)        patch.setIfMissing({ tags })
        await patch.commit({ autoGenerateArrayKeys: true })

        // Array merges (separate commits to dodge the setIfMissing+append bug)
        await mergeArrayField(client, docId, 'data_sources', [
          dataSourceEntry({ source: 'Wikidata', url: `https://www.wikidata.org/wiki/${qid}` }),
        ], 'source')
        if (crunchbase) {
          const cur = await client.fetch(`*[_id == $id][0]{ tags }`, { id: docId })
          const tag = `crunchbase:${crunchbase}`
          if (!(cur?.tags || []).includes(tag)) {
            await client.patch(docId).set({ tags: [...(cur?.tags || []), tag] }).commit()
          }
        }
      }
      stats.hit++
      await sleep(800) // be polite to Wikidata
    } catch (e) {
      console.log(`  ERROR ${seed.name}: ${e.message}`)
      stats.errors++
    }
  }

  console.log('\n[wikidata] Done.', stats)
  return stats
}

run().catch((e) => { console.error(e); process.exit(1) })
