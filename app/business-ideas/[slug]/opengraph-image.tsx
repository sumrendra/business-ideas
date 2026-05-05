import { ImageResponse } from 'next/og'
import { client } from '@/lib/sanity/client'
import { groq } from 'next-sanity'

export const alt = 'BusinessIdeas.live — business idea card'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const OG_QUERY = groq`
  *[_type == "businessIdea" && slug.current == $slug][0] {
    title,
    industry,
    setup_cost_range,
    monthly_revenue_range,
    difficulty_level
  }
`

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const idea = await client.fetch<{
    title: string
    industry?: string
    setup_cost_range?: string
    monthly_revenue_range?: string
    difficulty_level?: string
  } | null>(OG_QUERY, { slug })

  // Default OG font (Noto Sans) doesn't include the ₹ glyph — substitute "Rs"
  const stripRupee = (s?: string) => s?.replace(/₹/g, 'Rs ')

  const title = idea?.title ?? 'Business Idea'
  const industry = idea?.industry ?? 'India'
  const setup = stripRupee(idea?.setup_cost_range)
  const revenue = stripRupee(idea?.monthly_revenue_range)
  const difficulty = idea?.difficulty_level ? DIFFICULTY_LABEL[idea.difficulty_level] || idea.difficulty_level : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
          padding: 64,
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, fontWeight: 700 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'white',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 900,
            }}
          >
            B
          </div>
          <span>BusinessIdeas.live</span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            marginTop: 32,
          }}
        >
          <div style={{ display: 'flex', marginBottom: 28 }}>
            <div
              style={{
                display: 'flex',
                padding: '8px 18px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.18)',
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              {industry}
            </div>
          </div>
          <div
            style={{
              fontSize: title.length > 60 ? 60 : 72,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 1000,
              display: 'flex',
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28, fontSize: 22, fontWeight: 600 }}>
          {setup && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ opacity: 0.7, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Setup</span>
              <span>{setup}</span>
            </div>
          )}
          {revenue && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ opacity: 0.7, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Revenue</span>
              <span>{revenue}</span>
            </div>
          )}
          {difficulty && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ opacity: 0.7, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Difficulty</span>
              <span>{difficulty}</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
