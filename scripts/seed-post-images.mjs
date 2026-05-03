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

const posts = [
  {
    slug: 'best-business-ideas-india',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
    alt: 'Entrepreneurs brainstorming business ideas around a table in India',
  },
  {
    slug: 'small-business-ideas-low-budget',
    imageUrl: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=1200&q=80',
    alt: 'Small business owner working on a laptop in a cosy workspace',
  },
  {
    slug: 'new-business-ideas-india',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
    alt: 'Team of young entrepreneurs collaborating on new trending business ideas',
  },
  {
    slug: 'business-ideas-for-women',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80',
    alt: 'Confident Indian woman entrepreneur working on her business',
  },
  {
    slug: 'business-ideas-for-beginners',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80',
    alt: 'Beginner entrepreneur taking notes and planning a new business venture',
  },
  {
    slug: 'business-ideas-for-students',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
    alt: 'College students working together on a part-time business project',
  },
  {
    slug: 'low-investment-business-ideas',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=80',
    alt: 'Coins and a small plant symbolising low investment and growing returns',
  },
  {
    slug: 'low-cost-business-ideas',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
    alt: 'Person calculating costs and profits for a low-cost business',
  },
  {
    slug: 'zero-investment-business-ideas',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80',
    alt: 'Freelancer working from home on a laptop with zero investment',
  },
  {
    slug: 'online-business-ideas-india',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    alt: 'Person working on an online business from home with multiple screens',
  },
  {
    slug: 'it-business-ideas',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
    alt: 'IT startup team working on computers in a modern tech office',
  },
  {
    slug: 'online-business-for-beginners',
    imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=80',
    alt: 'Beginner setting up an online business on a laptop step by step',
  },
  {
    slug: 'home-business-ideas',
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80',
    alt: 'Home office setup with a laptop and desk plants for a work-from-home business',
  },
  {
    slug: 'home-based-small-business-ideas',
    imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&q=80',
    alt: 'Entrepreneur packing products at home for a small home-based business',
  },
  {
    slug: 'profitable-small-business-ideas',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80',
    alt: 'Business growth chart showing high profit margins for small businesses',
  },
  {
    slug: 'high-profit-low-cost-business-ideas',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=1200&q=80',
    alt: 'Stack of coins with upward arrow representing high profit low cost business',
  },
  {
    slug: 'tiny-business-ideas',
    imageUrl: 'https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=1200&q=80',
    alt: 'Small seedling growing into a large plant symbolising tiny business scaling',
  },
  {
    slug: 'creative-business-ideas',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    alt: 'Creative workspace with design tools and colourful ideas on a mood board',
  },
  {
    slug: 'top-10-small-business-ideas',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    alt: 'Top successful small businesses represented by a modern city skyline',
  },
  {
    slug: 'startup-business-ideas-india',
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80',
    alt: 'Indian startup founders pitching and executing their business idea',
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
}

async function seed() {
  const tmpDir = join(tmpdir(), 'sanity-post-images')
  mkdirSync(tmpDir, { recursive: true })

  const existingPosts = await client.fetch(
    '*[_type == "post" && defined(slug.current)]{ _id, "slug": slug.current }'
  )
  console.log(`Found ${existingPosts.length} posts in Sanity\n`)

  for (const post of posts) {
    const doc = existingPosts.find((d) => d.slug === post.slug)
    if (!doc) {
      console.log(`  SKIP (not found)  ${post.slug}`)
      continue
    }

    console.log(`Processing: ${post.slug}`)

    const tmpFile = join(tmpDir, `${post.slug}.jpg`)
    try {
      console.log(`  ↓ Downloading...`)
      await downloadImage(post.imageUrl, tmpFile)
    } catch (err) {
      console.log(`  ✗ Download failed: ${err.message}`)
      continue
    }

    console.log(`  ↑ Uploading to Sanity...`)
    let asset
    try {
      asset = await client.assets.upload('image', createReadStream(tmpFile), {
        filename: `${post.slug}.jpg`,
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
          alt: post.alt,
        },
      })
      .commit()

    console.log(`  ✓ Done — ${asset._id}\n`)
  }

  console.log('All post images processed.')
}

seed().catch((err) => { console.error(err.message); process.exit(1) })
