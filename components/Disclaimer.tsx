type Variant = 'idea' | 'finance' | 'blog'

const COPY: Record<Variant, { title: string; body: string }> = {
  idea: {
    title: 'Disclaimer',
    body: 'Setup costs, revenue ranges, unit economics and competitor data on this page are research-based estimates compiled from public sources and operator interviews. They are illustrative and should not be treated as guaranteed outcomes. Verify regulatory requirements, taxation and licensing with a qualified Chartered Accountant or legal advisor before starting a business.',
  },
  finance: {
    title: 'Important — read before applying',
    body: 'Calculators on this page produce estimates only. Actual loan eligibility, interest rates, processing fees and disbursal timelines are determined solely by the lending institution, are subject to credit appraisal, and may vary based on RBI policy. BusinessIdeas.live is not a lender or loan broker and does not earn commission on any government scheme. Always read the official scheme guidelines before applying.',
  },
  blog: {
    title: 'Editorial note',
    body: 'This article is for informational purposes only and does not constitute financial, tax, legal or investment advice. Consult a qualified professional for advice specific to your circumstances.',
  },
}

export default function Disclaimer({
  variant = 'idea',
  className = '',
}: {
  variant?: Variant
  className?: string
}) {
  const c = COPY[variant]
  return (
    <aside
      role="note"
      aria-label="Disclaimer"
      className={`rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500 ${className}`}
    >
      <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">{c.title}</p>
      <p>{c.body}</p>
    </aside>
  )
}
