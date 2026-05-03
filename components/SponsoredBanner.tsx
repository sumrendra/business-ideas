interface SponsoredBannerProps {
  sponsor: string
  text: string
  ctaLabel: string
  ctaHref: string
}

export default function SponsoredBanner({ sponsor, text, ctaLabel, ctaHref }: SponsoredBannerProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4">
      <div>
        <p className="text-xs font-medium text-slate-400">Sponsored · {sponsor}</p>
        <p className="mt-0.5 text-sm text-slate-700">{text}</p>
      </div>
      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        {ctaLabel}
      </a>
    </div>
  )
}
