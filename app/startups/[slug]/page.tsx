import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { STARTUP_BY_SLUG_QUERY, STARTUP_SLUGS_QUERY } from '@/lib/sanity/queries'
import type { Startup } from '@/lib/sanity/types'
import {
  STARTUP_STAGE_LABELS,
  STARTUP_STATUS_LABELS,
  BUSINESS_MODEL_LABELS,
} from '@/lib/sanity/types'

const BASE = 'https://businessideas.live'

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(STARTUP_SLUGS_QUERY)
  return slugs.map((s) => ({ slug: s.slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const s = await client.fetch<Startup | null>(
    STARTUP_BY_SLUG_QUERY,
    { slug },
    { next: { tags: ['startups', `startup:${slug}`] } },
  )
  if (!s) return { title: 'Startup not found' }
  const title = s.seo_title ?? `${s.name} — ${s.tagline ?? 'Indian Startup Profile'}`
  const description =
    s.seo_description ?? s.short_description ?? `${s.name}: revenue, funding, founders, and timeline.`
  return {
    title: title.slice(0, 60),
    description: description.slice(0, 160),
    alternates: { canonical: `${BASE}/startups/${s.slug}` },
    openGraph: {
      title,
      description,
      url: `${BASE}/startups/${s.slug}`,
      type: 'profile',
    },
  }
}

function fmtINR(n?: number) {
  if (n == null) return '—'
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`
  if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

export default async function StartupPage({ params }: Props) {
  const { slug } = await params
  const s = await client.fetch<Startup | null>(
    STARTUP_BY_SLUG_QUERY,
    { slug },
    { next: { tags: ['startups', `startup:${slug}`] } },
  )
  if (!s) notFound()

  const latestFinancials = s.financials?.[0]

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      {/* Identity */}
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Startup Profile
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{s.name}</h1>
        {s.legal_name && s.legal_name !== s.name && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Legal entity: {s.legal_name}
          </p>
        )}
        {s.tagline && (
          <p className="mt-3 text-lg text-slate-700 dark:text-slate-200">{s.tagline}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
          {s.industry && (
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5">{s.industry}</span>
          )}
          {s.stage && (
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 text-indigo-700 dark:text-indigo-300">
              {STARTUP_STAGE_LABELS[s.stage] ?? s.stage}
            </span>
          )}
          {s.status && s.status !== 'active' && (
            <span className="rounded-full bg-amber-50 dark:bg-amber-950 px-2 py-0.5 text-amber-700 dark:text-amber-300">
              {STARTUP_STATUS_LABELS[s.status] ?? s.status}
            </span>
          )}
          {s.business_model && (
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
              {BUSINESS_MODEL_LABELS[s.business_model] ?? s.business_model}
            </span>
          )}
          {s.hq_city && <span>· {s.hq_city}{s.hq_state ? `, ${s.hq_state}` : ''}</span>}
          {s.founded_year && <span>· Est. {s.founded_year}</span>}
          {s.website && (
            <a href={s.website} rel="noopener nofollow" target="_blank" className="underline">
              Website ↗
            </a>
          )}
        </div>
      </header>

      {s.short_description && (
        <section className="mb-8 text-base text-slate-700 dark:text-slate-200">
          {s.short_description}
        </section>
      )}

      {/* Quick stats */}
      <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Funding raised" value={fmtINR(s.total_funding_raised)} />
        <Stat label="Latest valuation" value={fmtINR(s.latest_valuation)} />
        <Stat label="Latest revenue" value={fmtINR(latestFinancials?.revenue)} />
        <Stat label="Employees" value={latestFinancials?.employee_count?.toLocaleString('en-IN') ?? '—'} />
      </section>

      {/* Founders */}
      {s.founders && s.founders.length > 0 && (
        <Section title="Founders">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {s.founders.map((f) => (
              <li key={f._id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <Link href={`/founders/${f.slug}`} className="font-medium text-slate-900 dark:text-slate-100 hover:underline">
                  {f.name}
                </Link>
                {f.short_bio && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{f.short_bio}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Funding rounds */}
      {s.funding_rounds && s.funding_rounds.length > 0 && (
        <Section title="Funding rounds">
          <ol className="space-y-2 text-sm">
            {s.funding_rounds
              .slice()
              .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
              .map((r) => (
                <li key={r._key ?? r.date} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{r.round_type ?? 'Round'}</span>
                  <span className="text-slate-500">{r.date}</span>
                  <span className="text-slate-700 dark:text-slate-200">{fmtINR(r.amount)}</span>
                  {r.lead_investor && <span className="text-slate-500">Led by {r.lead_investor}</span>}
                </li>
              ))}
          </ol>
        </Section>
      )}

      {/* Financial snapshots */}
      {s.financials && s.financials.length > 0 && (
        <Section title="Financials (MCA / self-reported)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                  <th className="py-2 pr-3">Fiscal year</th>
                  <th className="py-2 pr-3">Revenue</th>
                  <th className="py-2 pr-3">Profit / (Loss)</th>
                  <th className="py-2 pr-3">Employees</th>
                  <th className="py-2 pr-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {s.financials.map((f) => (
                  <tr key={f._key ?? f.fiscal_year} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="py-2 pr-3 font-medium">{f.fiscal_year}</td>
                    <td className="py-2 pr-3">{fmtINR(f.revenue)}</td>
                    <td className="py-2 pr-3">{fmtINR(f.profit)}</td>
                    <td className="py-2 pr-3">{f.employee_count ?? '—'}</td>
                    <td className="py-2 pr-3 text-slate-500">{f.source ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Long story — Portable Text will be rendered properly in the design pass */}
      {s.long_story && Array.isArray(s.long_story) && s.long_story.length > 0 && (
        <Section title="The full story">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Rich-text rendering of <code>long_story</code> is wired in the design pass.
          </p>
        </Section>
      )}

      {/* Milestones */}
      {s.milestones && s.milestones.length > 0 && (
        <Section title="Timeline">
          <ol className="space-y-2 text-sm">
            {s.milestones
              .slice()
              .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
              .map((m) => (
                <li key={m._key ?? `${m.date}-${m.title}`} className="flex gap-3">
                  <span className="w-24 shrink-0 text-slate-500">{m.date ?? '—'}</span>
                  <span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{m.title}</span>
                    {m.description && <span className="text-slate-500"> — {m.description}</span>}
                  </span>
                </li>
              ))}
          </ol>
        </Section>
      )}

      {/* Competitors */}
      {s.competitors && s.competitors.length > 0 && (
        <Section title="Competitors">
          <ul className="flex flex-wrap gap-2 text-sm">
            {s.competitors.map((c) => (
              <li key={c._id}>
                <Link
                  href={`/startups/${c.slug}`}
                  className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 hover:border-indigo-300"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Related ideas — cross-link into the existing /business-ideas surface */}
      {s.related_ideas && s.related_ideas.length > 0 && (
        <Section title="Related business ideas">
          <ul className="flex flex-wrap gap-2 text-sm">
            {s.related_ideas.map((idea) => (
              <li key={idea._id}>
                <Link
                  href={`/business-ideas/${idea.slug}`}
                  className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 hover:border-indigo-300"
                >
                  {idea.title}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Provenance */}
      {s.data_sources && s.data_sources.length > 0 && (
        <Section title="Data sources">
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            {s.data_sources.map((d) => (
              <li key={d._key ?? `${d.source}-${d.url}`}>
                {d.source}
                {d.url && (
                  <a href={d.url} rel="noopener nofollow" target="_blank" className="ml-1 underline">
                    ↗
                  </a>
                )}
                {d.last_fetched && <span> · last fetched {d.last_fetched.split('T')[0]}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <footer className="mt-10 text-xs text-slate-400">
        {s.last_updated_at && <span>Updated {s.last_updated_at.split('T')[0]}</span>}
        {s.cin && <span> · CIN: {s.cin}</span>}
      </footer>
    </article>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </h2>
      {children}
    </section>
  )
}
