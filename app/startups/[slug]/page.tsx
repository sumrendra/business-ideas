import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { readClient } from '@/lib/sanity/client'
import { STARTUP_BY_SLUG_QUERY, STARTUP_SLUGS_QUERY } from '@/lib/sanity/queries'
import type { Startup } from '@/lib/sanity/types'
import {
  STARTUP_STAGE_LABELS,
  STARTUP_STATUS_LABELS,
  BUSINESS_MODEL_LABELS,
} from '@/lib/sanity/types'

const BASE = 'https://businessideas.live'

export async function generateStaticParams() {
  const slugs = await readClient.fetch<{ slug: string }[]>(STARTUP_SLUGS_QUERY)
  return slugs.map((s) => ({ slug: s.slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const s = await readClient.fetch<Startup | null>(
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

// Profit/(Loss) for the financials table: positive shown with a leading "+",
// losses shown in parentheses, paired with color so it is never color-only.
function fmtProfit(n?: number): { text: string; tone: 'positive' | 'alert' | 'neutral' } {
  if (n == null) return { text: '—', tone: 'neutral' }
  if (n < 0) return { text: `(${fmtINR(Math.abs(n))})`, tone: 'alert' }
  if (n > 0) return { text: `+${fmtINR(n)}`, tone: 'positive' }
  return { text: fmtINR(0), tone: 'neutral' }
}

export default async function StartupPage({ params }: Props) {
  const { slug } = await params
  const s = await readClient.fetch<Startup | null>(
    STARTUP_BY_SLUG_QUERY,
    { slug },
    { next: { tags: ['startups', `startup:${slug}`] } },
  )
  if (!s) notFound()

  const latestFinancials = s.financials?.[0]

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 text-ink dark:text-paper-dark">
      {/* Identity */}
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600">
          Startup Profile
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink dark:text-paper-dark">{s.name}</h1>
        {s.legal_name && s.legal_name !== s.name && (
          <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
            Legal entity: {s.legal_name}
          </p>
        )}
        {s.tagline && (
          <p className="mt-3 text-lg leading-relaxed text-ink-soft dark:text-slate-200">{s.tagline}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-soft dark:text-slate-300">
          {s.industry && (
            <span className="rounded-full bg-surface-sunk dark:bg-surface-dark-raised px-2.5 py-0.5">{s.industry}</span>
          )}
          {s.stage && (
            <span className="rounded-full bg-brand-50 dark:bg-brand-600/15 px-2.5 py-0.5 font-medium text-brand-700 dark:text-brand-100">
              {STARTUP_STAGE_LABELS[s.stage] ?? s.stage}
            </span>
          )}
          {s.status && s.status !== 'active' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-caution/30 bg-caution/10 px-2.5 py-0.5 font-medium text-caution">
              <span aria-hidden className="text-[0.9em] leading-none">⚠</span>
              {STARTUP_STATUS_LABELS[s.status] ?? s.status}
            </span>
          )}
          {s.business_model && (
            <span className="rounded-full bg-surface-sunk dark:bg-surface-dark-raised px-2.5 py-0.5">
              {BUSINESS_MODEL_LABELS[s.business_model] ?? s.business_model}
            </span>
          )}
          {s.hq_city && <span>· {s.hq_city}{s.hq_state ? `, ${s.hq_state}` : ''}</span>}
          {s.founded_year && <span>· Est. <span className="tabular-nums">{s.founded_year}</span></span>}
          {s.website && (
            <a href={s.website} rel="noopener nofollow" target="_blank" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700">
              Website ↗
            </a>
          )}
        </div>
      </header>

      {s.short_description && (
        <section className="mb-8 max-w-[68ch] text-base leading-relaxed text-ink-soft dark:text-slate-200">
          {s.short_description}
        </section>
      )}

      {/* Quick stats */}
      <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Funding raised" value={fmtINR(s.total_funding_raised)} provenance="Total disclosed" />
        <Stat label="Latest valuation" value={fmtINR(s.latest_valuation)} provenance="Most recent round" />
        <Stat
          label="Latest revenue"
          value={fmtINR(latestFinancials?.revenue)}
          provenance={latestFinancials?.fiscal_year ? `FY ${latestFinancials.fiscal_year}` : undefined}
        />
        <Stat
          label="Employees"
          value={latestFinancials?.employee_count?.toLocaleString('en-IN') ?? '—'}
          provenance={latestFinancials?.fiscal_year ? `FY ${latestFinancials.fiscal_year}` : undefined}
        />
      </section>

      {/* Founders */}
      {s.founders && s.founders.length > 0 && (
        <Section title="Founders">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {s.founders.map((f) => (
              <li key={f._id} className="rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-4 transition-all hover:-translate-y-0.5 hover:border-brand-600/40 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] dark:hover:border-brand-500/40">
                <Link href={`/founders/${f.slug}`} className="font-semibold text-ink dark:text-paper-dark hover:text-brand-700 dark:hover:text-brand-100">
                  {f.name}
                </Link>
                {f.short_bio && (
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft dark:text-slate-400 line-clamp-3">{f.short_bio}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Funding rounds */}
      {s.funding_rounds && s.funding_rounds.length > 0 && (
        <Section title="Funding rounds">
          <ol className="divide-y divide-line dark:divide-line-dark overflow-hidden rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark text-sm">
            {s.funding_rounds
              .slice()
              .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
              .map((r) => (
                <li key={r._key ?? r.date} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3">
                  <span className="font-semibold text-ink dark:text-paper-dark">{r.round_type ?? 'Round'}</span>
                  <span className="tabular-nums text-ink-soft dark:text-slate-400">{r.date}</span>
                  <span className="ml-auto tabular-nums font-semibold text-ink dark:text-paper-dark">{fmtINR(r.amount)}</span>
                  {r.lead_investor && <span className="basis-full text-ink-soft dark:text-slate-400">Led by {r.lead_investor}</span>}
                </li>
              ))}
          </ol>
        </Section>
      )}

      {/* Financial snapshots */}
      {s.financials && s.financials.length > 0 && (
        <Section title="Financials" provenance="MCA / self-reported">
          <div className="overflow-x-auto rounded-xl border border-line dark:border-line-dark">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-sunk dark:bg-surface-dark-raised text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-soft dark:text-slate-400">
                  <th className="px-4 py-2.5 text-left">Fiscal year</th>
                  <th className="px-4 py-2.5 text-right">Revenue</th>
                  <th className="px-4 py-2.5 text-right">Profit / (Loss)</th>
                  <th className="px-4 py-2.5 text-right">Employees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-line-dark">
                {s.financials.map((f) => {
                  const p = fmtProfit(f.profit)
                  return (
                    <tr key={f._key ?? f.fiscal_year} className="bg-surface dark:bg-surface-dark">
                      <td className="px-4 py-2.5 font-medium tabular-nums text-ink dark:text-paper-dark">{f.fiscal_year}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-ink-soft dark:text-slate-300">{fmtINR(f.revenue)}</td>
                      <td
                        className={`px-4 py-2.5 text-right tabular-nums font-medium ${
                          p.tone === 'positive'
                            ? 'text-positive'
                            : p.tone === 'alert'
                              ? 'text-alert'
                              : 'text-ink-soft dark:text-slate-300'
                        }`}
                      >
                        {p.text}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-ink-soft dark:text-slate-300">
                        {f.employee_count?.toLocaleString('en-IN') ?? '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Long story — Portable Text will be rendered properly in the design pass */}
      {s.long_story && Array.isArray(s.long_story) && s.long_story.length > 0 && (
        <Section title="The full story">
          <p className="text-sm text-ink-soft dark:text-slate-400">
            Rich-text rendering of <code>long_story</code> is wired in the design pass.
          </p>
        </Section>
      )}

      {/* Milestones */}
      {s.milestones && s.milestones.length > 0 && (
        <Section title="Timeline">
          <ol className="space-y-3 text-sm">
            {s.milestones
              .slice()
              .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
              .map((m) => (
                <li key={m._key ?? `${m.date}-${m.title}`} className="flex gap-3">
                  <span className="w-24 shrink-0 tabular-nums text-ink-soft dark:text-slate-400">{m.date ?? '—'}</span>
                  <span className="border-l border-line dark:border-line-dark pl-3">
                    <span className="font-semibold text-ink dark:text-paper-dark">{m.title}</span>
                    {m.description && <span className="text-ink-soft dark:text-slate-400"> — {m.description}</span>}
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
                  className="rounded-full border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-1 text-ink-soft dark:text-slate-300 transition-colors hover:border-brand-600/40 hover:text-brand-700 dark:hover:text-brand-100"
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
                  className="rounded-full border border-line dark:border-line-dark bg-surface dark:bg-surface-dark px-3 py-1 text-ink-soft dark:text-slate-300 transition-colors hover:border-brand-600/40 hover:text-brand-700 dark:hover:text-brand-100"
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
          <ul className="space-y-1 text-xs text-caution">
            {s.data_sources.map((d) => (
              <li key={d._key ?? `${d.source}-${d.url}`}>
                {d.source}
                {d.url && (
                  <a href={d.url} rel="noopener nofollow" target="_blank" className="ml-1 underline underline-offset-2">
                    ↗
                  </a>
                )}
                {d.last_fetched && <span className="tabular-nums"> · last fetched {d.last_fetched.split('T')[0]}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <footer className="mt-10 border-t border-line dark:border-line-dark pt-4 text-xs text-ink-soft dark:text-slate-500">
        {s.last_updated_at && <span className="tabular-nums">Updated {s.last_updated_at.split('T')[0]}</span>}
        {s.cin && <span className="tabular-nums"> · CIN: {s.cin}</span>}
      </footer>
    </article>
  )
}

function Stat({
  label,
  value,
  provenance,
}: {
  label: string
  value: string
  provenance?: string
}) {
  return (
    <div className="rounded-xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-4">
      <div className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink-soft dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-ink dark:text-paper-dark">
        {value}
      </div>
      {provenance && (
        <div className="mt-1 text-[0.6875rem] text-caution">{provenance}</div>
      )}
    </div>
  )
}

function Section({
  title,
  provenance,
  children,
}: {
  title: string
  provenance?: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft dark:text-slate-400">
          {title}
        </h2>
        {provenance && (
          <span className="text-[0.6875rem] font-medium text-caution">{provenance}</span>
        )}
      </div>
      {children}
    </section>
  )
}
