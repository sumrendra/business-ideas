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
  STAGE_LABELS,
  DIFFICULTY_LABELS,
} from '@/lib/sanity/types'
import { PortableText } from '@portabletext/react'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(IDEA_SLUGS_QUERY)
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const idea = await client.fetch<Idea | null>(IDEA_BY_SLUG_QUERY, { slug: params.slug })
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

export default async function IdeaPage({ params }: PageProps) {
  const idea = await client.fetch<Idea | null>(
    IDEA_BY_SLUG_QUERY,
    { slug: params.slug },
    { next: { tags: ['business-ideas'] } }
  )

  if (!idea) notFound()

  const coverUrl = idea.cover_image
    ? urlFor(idea.cover_image).width(1200).height(600).url()
    : null

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/ideas" className="hover:text-indigo-600">Ideas</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{idea.title}</span>
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
        {idea.featured && (
          <span className="badge bg-indigo-100 text-indigo-700 mb-3">Featured</span>
        )}
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{idea.title}</h1>
        <p className="mt-3 text-lg text-slate-600">{idea.description}</p>
      </header>

      {/* Metadata grid */}
      <div className="mb-10 grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6 sm:grid-cols-4">
        <MetaItem label="Budget" value={BUDGET_LABELS[idea.budget_range] || idea.budget_range} />
        <MetaItem label="Industry" value={idea.industry} />
        <MetaItem
          label="Difficulty"
          value={DIFFICULTY_LABELS[idea.difficulty_level] || idea.difficulty_level}
          valueClass={DIFFICULTY_COLOR[idea.difficulty_level]}
        />
        <MetaItem label="Stage" value={STAGE_LABELS[idea.stage] || idea.stage} />
      </div>

      {/* Revenue model & resources */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2">
        {idea.revenue_model?.length > 0 && (
          <TagGroup label="Revenue Model" items={idea.revenue_model} color="bg-emerald-100 text-emerald-700" />
        )}
        {idea.resources_needed?.length > 0 && (
          <TagGroup label="Resources Needed" items={idea.resources_needed} color="bg-amber-100 text-amber-700" />
        )}
      </div>

      {/* Problem */}
      {idea.problem && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold text-slate-900">The Problem</h2>
          <div className="prose-content">
            <PortableText value={idea.problem as Parameters<typeof PortableText>[0]['value']} />
          </div>
        </section>
      )}

      {/* Solution */}
      {idea.solution && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold text-slate-900">The Solution</h2>
          <div className="prose-content">
            <PortableText value={idea.solution as Parameters<typeof PortableText>[0]['value']} />
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
                href={`/ideas?tags=${encodeURIComponent(tag)}`}
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
        <Link href="/ideas" className="btn-outline">
          ← Browse More Ideas
        </Link>
      </div>
    </article>
  )
}

function MetaItem({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-sm font-semibold rounded-full px-2 py-0.5 inline-block ${valueClass || 'text-slate-700'}`}>
        {value}
      </p>
    </div>
  )
}

function TagGroup({
  label,
  items,
  color,
}: {
  label: string
  items: string[]
  color: string
}) {
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
