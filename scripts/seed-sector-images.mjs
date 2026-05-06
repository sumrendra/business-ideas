import { createClient } from '@sanity/client'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { createReadStream } from 'fs'

const client = createClient({
  projectId: '5p3rso81',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Curated Unsplash photos — one per sector, no API key needed
const SECTOR_IMAGES = [
  {
    slug: 'agri-drone-services-marketplace',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80',
    alt: 'Agricultural drone flying over green crop fields for precision farming',
  },
  {
    slug: '3d-printing-service-bureau-industrial',
    imageUrl: 'https://images.unsplash.com/photo-1565034946487-077786996e27?w=1200&q=80',
    alt: 'Industrial 3D printer creating a complex metal component in a factory',
  },
  {
    slug: 'accessible-tourism-platform-differently-abled',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
    alt: 'Scenic travel destination with mountains and lush green landscape',
  },
  {
    slug: 'architecture-interior-design-platform-homeowners',
    imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80',
    alt: 'Professional meeting in a modern office representing B2B consulting services',
  },
  {
    slug: 'affordable-housing-investment-platform',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    alt: 'Modern residential apartment buildings representing real estate investment',
  },
  {
    slug: 'aquarium-exotic-pet-ecommerce',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80',
    alt: 'Adorable golden retriever puppy representing the pet care industry',
  },
  {
    slug: 'carbon-footprint-tracking-supply-chains',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80',
    alt: 'Logistics warehouse with workers and forklift managing supply chain operations',
  },
  {
    slug: 'agri-export-compliance-automation',
    imageUrl: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&q=80',
    alt: 'Cargo shipping containers at a port representing export and international trade',
  },
  {
    slug: 'ghost-kitchen-brand-incubator',
    imageUrl: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1200&q=80',
    alt: 'Professional chef preparing gourmet food in a modern commercial kitchen',
  },
]

async function downloadImage(url, filepath) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; seed-script/1.0)' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  writeFileSync(filepath, buffer)
  return filepath
}

async function seed() {
  const tmpDir = join(tmpdir(), 'sanity-sector-images')
  mkdirSync(tmpDir, { recursive: true })

  const existingIdeas = await client.fetch(
    '*[_type == "businessIdea" && defined(slug.current)]{ _id, "slug": slug.current }'
  )
  console.log(`Found ${existingIdeas.length} ideas in Sanity\n`)

  const onlySlugs = process.argv[2] ? process.argv[2].split(',') : null
  const toProcess = onlySlugs ? SECTOR_IMAGES.filter(i => onlySlugs.includes(i.slug)) : SECTOR_IMAGES

  for (const item of toProcess) {
    const doc = existingIdeas.find((d) => d.slug === item.slug)
    if (!doc) {
      console.log(`  SKIP (not found in Sanity): ${item.slug}`)
      continue
    }

    console.log(`Processing: ${item.slug}`)

    const tmpFile = join(tmpDir, `${item.slug}.jpg`)
    try {
      console.log(`  ↓ Downloading image...`)
      await downloadImage(item.imageUrl, tmpFile)
    } catch (err) {
      console.log(`  ✗ Download failed: ${err.message}`)
      continue
    }

    console.log(`  ↑ Uploading to Sanity...`)
    let asset
    try {
      asset = await client.assets.upload('image', createReadStream(tmpFile), {
        filename: `${item.slug}.jpg`,
        contentType: 'image/jpeg',
      })
    } catch (err) {
      console.log(`  ✗ Upload failed: ${err.message}`)
      continue
    }

    await client
      .patch(doc._id)
      .set({
        cover_image: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
          alt: item.alt,
        },
      })
      .commit()

    console.log(`  ✓ Done — asset ${asset._id}\n`)
  }

  console.log('All sector images uploaded.')
}

seed().catch((err) => { console.error(err.message); process.exit(1) })
