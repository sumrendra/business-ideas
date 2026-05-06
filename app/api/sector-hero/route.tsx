import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Background gradient palette per sector — keep in sync with sectors/page.tsx
const PALETTE: Record<string, [string, string]> = {
  agritech:        ['#65a30d', '#16a34a'], // lime → green
  manufacturing:   ['#475569', '#1e293b'], // slate → slate-900
  travel:          ['#0891b2', '#1d4ed8'], // cyan → blue
  'b2b-services':  ['#3b82f6', '#4f46e5'], // blue → indigo
  proptech:        ['#f97316', '#d97706'], // orange → amber
  petcare:         ['#f59e0b', '#ca8a04'], // amber → yellow
  logistics:       ['#64748b', '#1d4ed8'], // slate → blue
  export:          ['#14b8a6', '#059669'], // teal → emerald
  food:            ['#84cc16', '#16a34a'], // lime → green
  'Creator Economy': ['#d946ef', '#db2777'], // fuchsia → pink
}

export async function GET(req: NextRequest) {
  const sector = req.nextUrl.searchParams.get('sector') || 'Sector'
  const key = req.nextUrl.searchParams.get('key') || sector
  const [c1, c2] = PALETTE[key] ?? ['#4f46e5', '#312e81']

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Soft radial glow for depth */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 60%)',
            display: 'flex',
          }}
        />

        {/* Large faded sector name — decorative */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.08,
            fontSize: 200,
            fontWeight: 800,
            letterSpacing: -6,
            transform: 'rotate(-8deg)',
            color: 'white',
            whiteSpace: 'nowrap',
          }}
        >
          {sector}
        </div>

        {/* Foreground sector name */}
        <div
          style={{
            position: 'absolute',
            left: 56,
            bottom: 56,
            display: 'flex',
            flexDirection: 'column',
            color: 'white',
            maxWidth: 600,
          }}
        >
          <span style={{ fontSize: 18, opacity: 0.7, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>
            BusinessIdeas.live
          </span>
          <span style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.05, marginTop: 8 }}>
            {sector}
          </span>
        </div>
      </div>
    ),
    { width: 800, height: 480 }
  )
}
