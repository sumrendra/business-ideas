import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import { IDEA_BY_SLUG_QUERY, IDEA_SLUGS_QUERY } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import type { Idea } from '@/lib/sanity/types'
import {
  BUDGET_LABELS,
  MARKET_SATURATION_LABELS,
  DIFFICULTY_LABELS,
} from '@/lib/sanity/types'
import { PortableText } from '@portabletext/react'
import DownloadReportButton from '@/components/DownloadReportButtonWrapper'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(IDEA_SLUGS_QUERY)
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const idea = await client.fetch<Idea | null>(IDEA_BY_SLUG_QUERY, { slug })
  if (!idea) return {}
  return {
    title: idea.seo_title || idea.title,
    description: idea.seo_description || idea.description,
    openGraph: {
      title: idea.seo_title || idea.title,
      description: idea.seo_description || idea.description,
      images: idea.cover_image
        ? [urlFor(idea.cover_image).width(1200).height(630).url()]
        : [],
    },
  }
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced:     'bg-orange-100 text-orange-700',
  expert:       'bg-red-100 text-red-700',
}

const SATURATION_COLOR: Record<string, string> = {
  concept:     'bg-blue-100 text-blue-700',
  validated:   'bg-teal-100 text-teal-700',
  competitive: 'bg-orange-100 text-orange-700',
  proven:      'bg-green-100 text-green-700',
}

export default async function IdeaPage({ params }: PageProps) {
  const { slug } = await params
  const idea = await client.fetch<Idea | null>(
    IDEA_BY_SLUG_QUERY,
    { slug },
    { next: { tags: ['business-ideas'] } }
  )

  if (!idea) notFound()

  const coverUrl = idea.cover_image
    ? urlFor(idea.cover_image).width(1200).height(600).url()
    : null

  const hasNewMetrics =
    idea.monthly_revenue_range ||
    idea.time_to_first_revenue ||
    idea.breakeven_timeline ||
    idea.setup_cost_range ||
    idea.gross_margin

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/business-ideas" className="hover:text-indigo-600">Ideas</Link>
        <span className="mx-2">/</span>
        <span className="truncate text-slate-700">{idea.title}</span>
      </nav>

      {/* Cover Image */}
      {coverUrl && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl sm:h-80">
          <Image
            src={coverUrl}
            alt={idea.cover_image?.alt || idea.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap gap-2">
          {idea.featured && (
            <span className="badge bg-indigo-100 text-indigo-700">Featured</span>
          )}
          <span className="badge bg-slate-100 text-slate-600 text-xs">{idea.industry}</span>
          {idea.market_saturation && (
            <span className={`badge text-xs ${SATURATION_COLOR[idea.market_saturation]}`}>
              {MARKET_SATURATION_LABELS[idea.market_saturation] || idea.market_saturation}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{idea.title}</h1>
        <p className="mt-3 text-lg text-slate-600">{idea.description}</p>
      </header>

      {/* ── At a Glance metrics ─────────────────────────────────────────────── */}
      {hasNewMetrics && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">At a Glance</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {idea.monthly_revenue_range && (
              <GlanceCard label="Monthly Revenue" value={idea.monthly_revenue_range} accent="green" />
            )}
            {idea.time_to_first_revenue && (
              <GlanceCard label="Time to First Revenue" value={idea.time_to_first_revenue} accent="blue" />
            )}
            {idea.breakeven_timeline && (
              <GlanceCard label="Break-even" value={idea.breakeven_timeline} accent="amber" />
            )}
            {idea.setup_cost_range && (
              <GlanceCard label="Setup Cost" value={idea.setup_cost_range} accent="slate" />
            )}
            {idea.gross_margin && (
              <GlanceCard label="Gross Margin" value={idea.gross_margin} accent="indigo" />
            )}
            {idea.difficulty_level && (
              <GlanceCard
                label="Difficulty"
                value={DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level}
                accent={idea.difficulty_level === 'beginner' ? 'green' : idea.difficulty_level === 'intermediate' ? 'amber' : 'red'}
              />
            )}
          </div>
        </section>
      )}

      {/* ── Step 1 to Start ──────────────────────────────────────────────────── */}
      {idea.first_step && (
        <div className="mb-10 flex gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white text-xl font-bold">
            1
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-1">Start Here — This Week</p>
            <p className="text-sm text-slate-700 leading-relaxed">{idea.first_step}</p>
          </div>
        </div>
      )}

      {/* Demand Signal */}
      {idea.demand_signal && (
        <div className="mb-10 rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-wide text-indigo-500">Market Demand Signal</span>
          <p className="mt-0.5 text-sm font-medium text-slate-800">{idea.demand_signal}</p>
        </div>
      )}

      {/* Revenue model & resources */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2">
        {idea.revenue_model?.length > 0 && (
          <TagGroup label="Revenue Model" items={idea.revenue_model} color="bg-emerald-100 text-emerald-700" />
        )}
        {idea.resources_needed?.length > 0 && (
          <TagGroup label="Resources Needed" items={idea.resources_needed} color="bg-amber-100 text-amber-700" />
        )}
      </div>

      {/* Who Is It For */}
      {idea.target_audience && (
        <Section title="Who Is It For?">
          <PortableText value={idea.target_audience as Parameters<typeof PortableText>[0]['value']} />
        </Section>
      )}

      {/* What Works & Why */}
      {idea.why_it_works && (
        <Section title="What Works in This & Why?">
          <PortableText value={idea.why_it_works as Parameters<typeof PortableText>[0]['value']} />
        </Section>
      )}

      {/* ── Download Report CTA (mid-page) ───────────────────────────────────── */}
      <div className="my-12 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-1">Free Download</p>
            <h3 className="text-xl font-bold">Get the Full Launch Kit for this Idea</h3>
            <p className="mt-1 text-sm text-indigo-200">
              Detailed financial model · Supplier &amp; vendor contacts · 90-day checklist · City-wise demand data
            </p>
          </div>
          <DownloadReportButton idea={idea} />
        </div>
      </div>

      {/* Scope in India */}
      {idea.scope_in_india && (
        <Section title="Scope in India">
          <PortableText value={idea.scope_in_india as Parameters<typeof PortableText>[0]['value']} />
        </Section>
      )}

      {/* Things to Be Mindful Of */}
      {idea.things_to_note && idea.things_to_note.length > 0 && (
        <Section title="Things to Be Mindful Of">
          <ul className="space-y-2">
            {idea.things_to_note.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Current Landscape */}
      {idea.current_landscape && (
        <Section title="Current Landscape in India">
          <PortableText value={idea.current_landscape as Parameters<typeof PortableText>[0]['value']} />
        </Section>
      )}

      {/* Licenses Required */}
      {idea.licenses_required && idea.licenses_required.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-xl font-bold text-slate-900">Licenses &amp; Registrations</h2>
          <div className="flex flex-wrap gap-2">
            {idea.licenses_required.map((lic) => (
              <span key={lic} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm">
                <span className="text-green-500">✓</span>
                {lic}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Pros & Cons */}
      {((idea.pros && idea.pros.length > 0) || (idea.cons && idea.cons.length > 0)) && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Pros &amp; Cons</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {idea.pros && idea.pros.length > 0 && (
              <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-600">Pros</p>
                <ul className="space-y-2">
                  {idea.pros.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-0.5 text-green-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {idea.cons && idea.cons.length > 0 && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-red-600">Cons</p>
                <ul className="space-y-2">
                  {idea.cons.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-0.5 text-red-400">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Proof Points */}
      {idea.proof_points && idea.proof_points.length > 0 && (
        <section className="mt-10 border-t border-slate-100 pt-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Real-World Proof</h2>
          <div className="space-y-4">
            {idea.proof_points.map((pp) => (
              <div
                key={pp._key}
                className={`rounded-xl border p-5 ${
                  pp.type === 'Case Study'
                    ? 'border-indigo-100 bg-indigo-50'
                    : pp.type === 'Government Source'
                    ? 'border-green-100 bg-green-50'
                    : 'border-amber-100 bg-amber-50'
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                    pp.type === 'Case Study'
                      ? 'bg-indigo-200 text-indigo-800'
                      : pp.type === 'Government Source'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-amber-200 text-amber-800'
                  }`}>
                    {pp.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{pp.source}</span>
                  {pp.founder && <span className="text-xs text-slate-500">· {pp.founder}</span>}
                </div>
                {pp.url ? (
                  <a href={pp.url} target="_blank" rel="noopener noreferrer"
                    className="font-semibold text-slate-800 hover:text-indigo-700 hover:underline leading-snug">
                    {pp.headline} ↗
                  </a>
                ) : (
                  <p className="font-semibold text-slate-800 leading-snug">{pp.headline}</p>
                )}
                {pp.key_stat && (
                  <p className="mt-2 text-sm font-medium text-slate-700">📊 {pp.key_stat}</p>
                )}
                {pp.quote && (
                  <blockquote className="mt-2 border-l-2 border-slate-300 pl-3 text-sm italic text-slate-600">
                    "{pp.quote}"
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {idea.tags?.length > 0 && (
        <div className="mt-10 border-t border-slate-100 pt-6">
          <p className="mb-2 text-sm font-medium text-slate-500">Tags</p>
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((tag) => (
              <Link
                key={tag}
                href={`/business-ideas?tags=${encodeURIComponent(tag)}`}
                className="badge bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back CTA */}
      <div className="mt-12 text-center">
        <Link href="/business-ideas" className="btn-outline">
          ← Browse More Ideas
        </Link>
      </div>
    </article>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

const ACCENT_STYLES: Record<string, { bg: string; border: string; label: string; value: string }> = {
  green:  { bg: 'bg-green-50',  border: 'border-green-100',  label: 'text-green-600',  value: 'text-green-800' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-100',   label: 'text-blue-600',   value: 'text-blue-800' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-100',  label: 'text-amber-600',  value: 'text-amber-800' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', label: 'text-indigo-600', value: 'text-indigo-800' },
  red:    { bg: 'bg-red-50',    border: 'border-red-100',    label: 'text-red-600',    value: 'text-red-800' },
  slate:  { bg: 'bg-slate-50',  border: 'border-slate-200',  label: 'text-slate-500',  value: 'text-slate-800' },
}

function GlanceCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  const s = ACCENT_STYLES[accent] || ACCENT_STYLES.slate
  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-4`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${s.label} mb-1`}>{label}</p>
      <p className={`text-sm font-bold ${s.value}`}>{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-bold text-slate-900">{title}</h2>
      <div className="prose-content">{children}</div>
    </section>
  )
}

function TagGroup({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`badge ${color}`}>{item}</span>
        ))}
      </div>
    </div>
  )
}
