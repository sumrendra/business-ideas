'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'How do I know which business idea is right for me?',
    a: 'Start by filtering on your available budget and complexity level. If you\'re a first-time founder, look for ideas tagged "Beginner" and "Solo Founder OK". Each idea page includes resources needed, revenue model, and break-even estimates to help you evaluate fit.',
  },
  {
    q: 'Are the investment ranges on this site accurate for 2025?',
    a: 'Yes — all investment and profit estimates are benchmarked for the Indian market in 2025. They reflect real-world costs including rent, licensing, staffing, and raw materials at current rates. Treat them as indicative ranges; actual numbers vary by city and execution.',
  },
  {
    q: 'Can I start these businesses from tier-2 or tier-3 cities?',
    a: 'Many ideas are explicitly tagged as "Local" or "Pan-India" to indicate scale potential. Cloud kitchens, retail, and service-based ideas often work best in smaller cities due to lower overhead. The Scalability tag on each card will guide you.',
  },
  {
    q: 'How often are new ideas added?',
    a: 'We publish 3 new curated business ideas every week, each with full market analysis, investment breakdown, and step-by-step guidance. Subscribe to the newsletter to get them delivered directly.',
  },
  {
    q: 'Is this content free to access?',
    a: 'Yes — all idea listings, filters, and blog articles are completely free. We are supported by partner integrations and sponsored listings from relevant financial and business tools.',
  },
]

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
      {FAQS.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <span>{faq.q}</span>
            <span className="shrink-0 text-slate-400">{openIndex === i ? '▲' : '▼'}</span>
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{faq.a}</div>
          )}
        </div>
      ))}
    </div>
  )
}
