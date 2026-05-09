import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import { SECTOR_HEROES_QUERY } from '@/lib/sanity/queries'
import { Ld, breadcrumbSchema } from '@/lib/jsonld'

const BASE = 'https://businessideas.live'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Business Ideas by Industry Sector — Food, Tech, Retail, Agriculture & More',
  description:
    'Explore curated business ideas by industry sector — Food & Beverage, Technology, Retail, Agriculture, Manufacturing, and more. Find the right sector for your Indian startup.',
  alternates: { canonical: `${BASE}/sectors` },
  openGraph: {
    title: 'Business Ideas by Industry Sector | businessideas.live',
    description: 'Browse 298 vetted Indian business ideas by sector — Food & Beverage, Technology, Retail, Agriculture, Manufacturing, and more.',
    url: `${BASE}/sectors`,
    siteName: 'businessideas.live',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@businessideaslive',
    title: 'Business Ideas by Industry Sector | businessideas.live',
    description: 'Browse 298 vetted Indian business ideas by sector — Food & Beverage, Technology, Retail, Agriculture, Manufacturing, and more.',
  },
}

interface SectorHero {
  industry: string
  cover?: { asset?: { url?: string }; alt?: string } | null
}

// Each sector: pretty display name, the actual industry value stored in Sanity,
// the SEO-optimised category slug (when one exists), and a fallback gradient.
const SECTORS: {
  display: string
  industry: string
  slug: string | null
  fallback: string
}[] = [
  { display: 'SaaS',                      industry: 'SaaS',                     slug: 'saas',          fallback: 'from-indigo-500 to-violet-600' },
  { display: 'E-commerce',                industry: 'E-commerce',               slug: 'ecommerce',     fallback: 'from-rose-500 to-pink-600' },
  { display: 'Health & Wellness',         industry: 'Health & Wellness',        slug: 'health',        fallback: 'from-pink-500 to-rose-600' },
  { display: 'EdTech',                    industry: 'EdTech',                   slug: 'edtech',        fallback: 'from-amber-500 to-orange-600' },
  { display: 'FinTech',                   industry: 'FinTech',                  slug: 'fintech',       fallback: 'from-sky-500 to-blue-600' },
  { display: 'Creator Economy',           industry: 'Creator Economy',          slug: null,            fallback: 'from-fuchsia-500 to-pink-600' },
  { display: 'Local Services',            industry: 'Local Services',           slug: 'local-services', fallback: 'from-emerald-500 to-teal-600' },
  { display: 'Climate & Sustainability',  industry: 'Climate / Sustainability', slug: 'climate',       fallback: 'from-emerald-500 to-cyan-600' },
  { display: 'AI & Machine Learning',     industry: 'AI / ML',                  slug: 'ai-ml',         fallback: 'from-violet-500 to-fuchsia-600' },
  { display: 'AgriTech & Food',           industry: 'agritech',                 slug: null,            fallback: 'from-lime-500 to-emerald-600' },
  { display: 'Manufacturing',             industry: 'manufacturing',            slug: null,            fallback: 'from-slate-500 to-slate-700' },
  { display: 'Travel & Hospitality',      industry: 'travel',                   slug: null,            fallback: 'from-cyan-500 to-blue-600' },
  { display: 'B2B Services',              industry: 'b2b-services',             slug: null,            fallback: 'from-blue-500 to-indigo-600' },
  { display: 'Real Estate & PropTech',    industry: 'proptech',                 slug: null,            fallback: 'from-orange-500 to-amber-600' },
  { display: 'Pet & Animal Care',         industry: 'petcare',                  slug: null,            fallback: 'from-amber-500 to-yellow-600' },
  { display: 'Logistics & Supply Chain',  industry: 'logistics',                slug: null,            fallback: 'from-slate-500 to-blue-600' },
  { display: 'Export & Trade',            industry: 'export',                   slug: null,            fallback: 'from-teal-500 to-emerald-600' },
]

export default async function SectorsPage() {
  const ideas = await client.fetch<SectorHero[]>(
    SECTOR_HEROES_QUERY,
    {},
    { next: { tags: ['business-ideas'] } }
  )

  // Build {industry → first cover image} and {industry → count} from one query
  const heroByIndustry = new Map<string, SectorHero['cover']>()
  const countByIndustry = new Map<string, number>()
  for (const idea of ideas) {
    const ind = idea.industry
    if (!ind) continue
    countByIndustry.set(ind, (countByIndustry.get(ind) ?? 0) + 1)
    if (!heroByIndustry.has(ind) && idea.cover?.asset?.url) {
      heroByIndustry.set(ind, idea.cover)
    }
  }

  const totalIdeas = ideas.length

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: 'https://businessideas.live/' },
    { name: 'Sectors', url: 'https://businessideas.live/sectors' },
  ])

  return (
    <>
    <Ld data={breadcrumb} />
    <div className="mx-auto max-w-7xl px-4 py-14">
      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Sectors</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
          Browse business ideas by sector
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          {SECTORS.length} industries · {totalIdeas} validated ideas, all tailored for the Indian market.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SECTORS.map((s) => {
          const cover = heroByIndustry.get(s.industry)
          const count = countByIndustry.get(s.industry) ?? 0
          const href = s.slug
            ? `/business-ideas/${s.slug}`
            : `/business-ideas?industry=${encodeURIComponent(s.industry)}`

          return (
            <Link
              key={s.display}
              href={href}
              className="group relative aspect-[5/3] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              {/* Background — Sanity cover if exists, else generated sector hero */}
              <Image
                src={
                  cover?.asset?.url
                    ? urlFor(cover).width(800).height(480).url()
                    : `/api/sector-hero?sector=${encodeURIComponent(s.display)}&key=${encodeURIComponent(s.industry)}`
                }
                alt={cover?.alt || `${s.display} business ideas`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                unoptimized={!cover?.asset?.url}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Dark gradient overlay so text stays legible on any image */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-slate-950/10" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-5">
                <div className="flex justify-end">
                  {count > 0 && (
                    <span className="rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white border border-white/15">
                      {count} {count === 1 ? 'idea' : 'ideas'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {s.display}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                    Browse ideas →
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
    </>
  )
}
