import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { createReadStream } from 'fs'

const cliConfig = JSON.parse(readFileSync(join(process.env.HOME, '.config/sanity/config.json'), 'utf8'))

const client = createClient({
  projectId: '5p3rso81',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: cliConfig.authToken,
  useCdn: false,
})

// Unsplash direct photo URLs (high quality, free to use)
const ideas = [
  {
    slug: 'home-tiffin-meal-subscription-service',
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80',
    alt: 'Home cooked Indian meal in tiffin containers ready for delivery',
  },
  {
    slug: 'youtube-automation-faceless-content-channel',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&q=80',
    alt: 'YouTube content creation setup with a laptop and video editing software',
  },
  {
    slug: 'hyperlocal-d2c-skincare-brand',
    imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&q=80',
    alt: 'Natural skincare products arranged on a clean white surface',
  },
  {
    slug: 'edtech-vernacular-skill-based-courses',
    imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&q=80',
    alt: 'Student learning online with laptop and notebook for skill-based courses',
  },
  {
    slug: 'ai-powered-resume-linkedin-profile-writing-service',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80',
    alt: 'Professional resume and laptop representing AI-powered career services',
  },
  {
    slug: 'solar-panel-installation-maintenance-business',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80',
    alt: 'Solar panels installed on a rooftop under clear blue sky',
  },
  {
    slug: 'saas-restaurant-cloud-kitchen-management-tool',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    alt: 'Modern restaurant kitchen with chefs preparing food',
  },
  {
    slug: 'mental-health-wellness-platform-b2b-b2c',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80',
    alt: 'Person meditating peacefully representing mental health and wellness',
  },
  {
    slug: 'fintech-embedded-credit-kirana-small-retailers',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
    alt: 'Small kirana store owner using a smartphone for digital payments',
  },
  {
    slug: 'sustainable-reusable-packaging-ecommerce-fmcg',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80',
    alt: 'Eco-friendly sustainable packaging made from natural materials',
  },
  {
    slug: 'hyperlocal-senior-care-companionship-services',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&q=80',
    alt: 'Caregiver providing compassionate support to an elderly person at home',
  },
  {
    slug: 'ai-powered-social-media-content-agency',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&q=80',
    alt: 'Social media content creation with phone and creative workspace',
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
  const tmpDir = join(tmpdir(), 'sanity-idea-images')
  mkdirSync(tmpDir, { recursive: true })

  // Fetch all existing ideas
  const existingIdeas = await client.fetch(
    '*[_type == "businessIdea" && defined(slug.current)]{ _id, "slug": slug.current, "hasCover": defined(cover_image) }'
  )
  console.log(`Found ${existingIdeas.length} ideas in Sanity\n`)

  for (const idea of ideas) {
    const doc = existingIdeas.find((d) => d.slug === idea.slug)
    if (!doc) {
      console.log(`  SKIP (not found)  ${idea.slug}`)
      continue
    }

    console.log(`Processing: ${idea.slug}`)

    // Download image
    const tmpFile = join(tmpDir, `${idea.slug}.jpg`)
    try {
      console.log(`  ↓ Downloading image...`)
      await downloadImage(idea.imageUrl, tmpFile)
    } catch (err) {
      console.log(`  ✗ Download failed: ${err.message}`)
      continue
    }

    // Upload to Sanity
    console.log(`  ↑ Uploading to Sanity...`)
    let asset
    try {
      asset = await client.assets.upload('image', createReadStream(tmpFile), {
        filename: `${idea.slug}.jpg`,
        contentType: 'image/jpeg',
      })
    } catch (err) {
      console.log(`  ✗ Upload failed: ${err.message}`)
      continue
    }

    // Patch the document
    await client
      .patch(doc._id)
      .set({
        cover_image: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
          alt: idea.alt,
        },
      })
      .commit()

    console.log(`  ✓ Done — asset ${asset._id}\n`)
  }

  console.log('All images processed.')
}

seed().catch((err) => { console.error(err.message); process.exit(1) })
