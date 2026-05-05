import { ImageResponse } from 'next/og'

export const alt = 'BusinessIdeas.live — 300+ validated business ideas in India'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
          <div style={{ fontSize: 80, fontWeight: 800, lineHeight: 1.05, maxWidth: 1000, display: 'flex' }}>
            300+ validated business ideas in India
          </div>
          <div style={{ marginTop: 28, fontSize: 32, fontWeight: 500, opacity: 0.9, display: 'flex' }}>
            Setup costs · unit economics · competitor data · funding routes
          </div>
        </div>

        <div style={{ display: 'flex', gap: 40, fontSize: 22, fontWeight: 600, opacity: 0.85 }}>
          <span>businessideas.live</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
