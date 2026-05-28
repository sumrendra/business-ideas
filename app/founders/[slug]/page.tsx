import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { FOUNDER_BY_SLUG_QUERY, FOUNDER_SLUGS_QUERY } from '@/lib/sanity/queries'
import type { StartupFounder, Startup } from '@/lib/sanity/types'

const BASE = 'https://businessideas.live'

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(FOUNDER_SLUGS_QUERY)
  return slugs.map((s) => ({ slug: s.slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const f = await client.fetch<(StartupFounder & { startups?: Startup[] }) | null>(
    FOUNDER_BY_SLUG_QUERY,
    { slug },
    { next: { tags: ['startup-founders', `founder:${slug}`] } },
  )
  if (!f) return { title: 'Founder not found' }
  const startupNames = (f.startups ?? []).map((s) => s.name).slice(0, 3).join(', ')
  return {
    title: `${f.name}${startupNames ? ` — founder of ${startupNames}` : ' — Indian founder profile'}`,
    description: f.short_bio ?? `Profile of ${f.name} — Indian startup founder.`,
    alternates: { canonical: `${BASE}/founders/${f.slug}` },
  }
}

export default async function FounderPage({ params }: Props) {
  const { slug } = await params
  const f = await client.fetch<(StartupFounder & { startups?: Startup[] }) | null>(
    FOUNDER_BY_SLUG_QUERY,
    { slug },
    { next: { tags: ['startup-founders', `founder:${slug}`] } },
  )
  if (!f) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Founder Profile
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{f.name}</h1>
        {f.hometown && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.hometown}</p>
        )}
        {f.background && f.background.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            {f.background.map((b) => (
              <span key={b} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5">{b}</span>
            ))}
          </div>
        )}
      </header>

      {f.short_bio && (
        <section className="mb-8 text-base text-slate-700 dark:text-slate-200">{f.short_bio}</section>
      )}

      {(f.linkedin_url || f.twitter_handle || f.personal_site) && (
        <section className="mb-8 flex flex-wrap gap-3 text-sm">
          {f.linkedin_url && (
            <a href={f.linkedin_url} rel="noopener nofollow" target="_blank" className="underline">
              LinkedIn ↗
            </a>
          )}
          {f.twitter_handle && (
            <a href={`https://x.com/${f.twitter_handle.replace(/^@/, '')}`} rel="noopener nofollow" target="_blank" className="underline">
              @{f.twitter_handle.replace(/^@/, '')} ↗
            </a>
          )}
          {f.personal_site && (
            <a href={f.personal_site} rel="noopener nofollow" target="_blank" className="underline">
              Website ↗
            </a>
          )}
        </section>
      )}

      {f.startups && f.startups.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Startups
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {f.startups.map((s) => (
              <li key={s._id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <Link href={`/startups/${s.slug}`} className="font-medium text-slate-900 dark:text-slate-100 hover:underline">
                  {s.name}
                </Link>
                {s.tagline && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{s.tagline}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
