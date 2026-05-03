const PARTNERS = [
  'IndiaMART',
  'Razorpay',
  'Razorpay Rize',
  'Startup India',
  'CA Connect',
]

export default function PartnersStrip() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-semibold text-slate-500">Partners &amp; tools:</span>
      {PARTNERS.map((name) => (
        <span
          key={name}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
        >
          {name}
        </span>
      ))}
    </div>
  )
}
