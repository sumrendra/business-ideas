export const meta = {
  name: 'startup-research-batch',
  description: 'Research Indian startups and produce source-cited enrichment JSON (cite-or-blank)',
  phases: [{ title: 'Research', detail: 'one research agent per company' }],
}

const SCHEMA = {
  type: 'object',
  required: ['slug', 'sources'],
  properties: {
    slug: { type: 'string' },
    found: { type: 'boolean' },
    tagline: { type: 'string' },
    short_description: { type: 'string' },
    long_story: { type: 'array', items: { type: 'string' } },
    total_funding_raised: { type: 'number', description: 'INR rupees' },
    latest_valuation: { type: 'number', description: 'INR rupees' },
    status: { type: 'string' },
    founders: {
      type: 'array',
      items: {
        type: 'object', required: ['name'],
        properties: {
          name: { type: 'string' }, short_bio: { type: 'string' },
          linkedin_url: { type: 'string' }, twitter_handle: { type: 'string' },
          background: { type: 'array', items: { type: 'string' } },
          hometown: { type: 'string' }, source_url: { type: 'string' },
        },
      },
    },
    funding_rounds: {
      type: 'array',
      items: {
        type: 'object', required: ['date'],
        properties: {
          date: { type: 'string', description: 'YYYY-MM-DD' },
          round_type: { type: 'string' }, amount: { type: 'number', description: 'INR' },
          amount_usd: { type: 'number' }, lead_investor: { type: 'string' },
          all_investors: { type: 'array', items: { type: 'string' } },
          valuation_at_round: { type: 'number' }, source_url: { type: 'string' },
        },
      },
    },
    financials: {
      type: 'array',
      items: {
        type: 'object', required: ['fiscal_year'],
        properties: {
          fiscal_year: { type: 'string' }, revenue: { type: 'number', description: 'INR' },
          profit: { type: 'number' }, ebitda: { type: 'number' },
          employee_count: { type: 'number' }, source: { type: 'string' }, source_url: { type: 'string' },
        },
      },
    },
    milestones: {
      type: 'array',
      items: {
        type: 'object', required: ['title'],
        properties: {
          date: { type: 'string' }, title: { type: 'string' },
          description: { type: 'string' }, source_url: { type: 'string' },
        },
      },
    },
    sources: {
      type: 'array',
      items: { type: 'object', required: ['url'], properties: { source: { type: 'string' }, url: { type: 'string' } } },
    },
  },
}

const INLINE = [
  { slug: 'cardekho', name: 'CarDekho', web: 'https://www.cardekho.com', industry: 'E-commerce' },
]

// args (preferred) is the company list passed at invocation. The Workflow
// runtime may deliver it as an array OR as a JSON string, so handle both.
// Falls back to INLINE only when args is empty/absent.
let companies = INLINE
try {
  if (Array.isArray(args) && args.length) companies = args
  else if (typeof args === 'string' && args.trim().startsWith('[')) companies = JSON.parse(args)
} catch { companies = INLINE }

phase('Research')

const results = await parallel(companies.map((c) => () =>
  agent(
    `You are a financial researcher building a credible Indian startup database. Research the Indian startup "${c.name}" (website: ${c.web}; sector: ${c.industry || 'unknown'}).

Be efficient: run 3-4 focused WebSearch queries, then fetch AT MOST 2 of the most authoritative pages (prefer Wikipedia, Inc42, YourStory, Entrackr, MoneyControl, Economic Times, Tracxn, Crunchbase, the company's own About/Press page). Lean on the search-result snippets for facts you do not need to open a full page to confirm. Look for: founders, founding year, total funding raised, individual funding rounds (date, round, amount, lead investor, valuation), latest valuation, annual revenue/profit (FY23/FY24 from MCA/Tofler/Entrackr), 3-5 key milestones, current status (active/acquired/shut down).

Return the enrichment as structured output for slug "${c.slug}".

ABSOLUTE RULES, CITE-OR-BLANK:
- Every number (funding, valuation, revenue, profit) MUST come from a source you actually saw (search snippet or fetched page). If you cannot verify a field, OMIT it. A blank field is correct; a guessed number is a critical failure.
- All rupee amounts in INR RUPEES (not crores): 1200 crore = 1200 * 10^7 = 12000000000. Convert USD to INR at 83 ONLY when the source gives USD; also put the USD in amount_usd.
- founders[].source_url, funding_rounds[].source_url, financials[].source_url should point to the source for that fact where possible.
- sources[] is REQUIRED: list the real URLs you used. If you found essentially nothing verifiable, return { slug, found: false, sources: [] } and nothing else.
- short_description: 2-3 plain sentences, no marketing fluff, no em dashes.
- long_story: EXACTLY 3 short paragraphs (founding, scaling/funding, where they are today), grounded in the sources. India context framing. No em dashes.
- Be concise. Prefer accuracy over completeness: 3 well-sourced fields beat 10 shaky ones.`,
    { schema: SCHEMA, model: 'haiku', label: `research:${c.slug}`, phase: 'Research' }
  ).then((r) => ({ ...r, slug: c.slug })).catch(() => null)
))

const ok = results.filter(Boolean).filter((r) => r && r.sources && r.sources.length > 0)
log(`Research done: ${ok.length}/${companies.length} returned cited data`)

const payload = {}
for (const r of ok) {
  const { slug, found, ...fields } = r
  if (found === false) continue
  payload[slug] = fields
}

return { count: Object.keys(payload).length, attempted: companies.length, payload }
