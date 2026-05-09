'use client'

import { useEffect, useState } from 'react'

const PHRASES = [
  'business idea',
  'market opportunity',
  'profitable niche',
  'hyperlocal gap',
  'funding strategy',
  'revenue stream',
]

const INTERVAL = 2800

export default function RotatingText() {
  const [index, setIndex]   = useState(0)
  const [phase, setPhase]   = useState<'visible' | 'exit' | 'enter'>('visible')

  useEffect(() => {
    const tick = setInterval(() => {
      // 1. slide current text up + fade out
      setPhase('exit')
      setTimeout(() => {
        // 2. swap text (still invisible, positioned below)
        setIndex(i => (i + 1) % PHRASES.length)
        setPhase('enter')
        // 3. slide new text into place
        setTimeout(() => setPhase('visible'), 30)
      }, 320)
    }, INTERVAL)
    return () => clearInterval(tick)
  }, [])

  return (
    <span
      className="relative inline-block overflow-hidden align-bottom"
      style={{ paddingBottom: '0.15em', marginBottom: '-0.15em' }}
    >
      <span
        className={`inline-block transition-all duration-300 ease-in-out text-indigo-600 dark:text-indigo-400 ${
          phase === 'visible'
            ? 'translate-y-0 opacity-100'
            : phase === 'exit'
            ? '-translate-y-full opacity-0'
            : 'translate-y-full opacity-0'
        }`}
        style={{ transitionProperty: 'transform, opacity' }}
      >
        {PHRASES[index]}
      </span>
      {/* invisible spacer — locks width to longest phrase, prevents layout shift */}
      <span aria-hidden className="invisible absolute left-0 top-0 whitespace-nowrap">
        {PHRASES.reduce((a, b) => (a.length >= b.length ? a : b))}
      </span>
    </span>
  )
}
