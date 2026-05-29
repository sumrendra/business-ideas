interface SponsoredBannerProps {
  sponsor: string
  text: string
  ctaLabel: string
  ctaHref: string
}

export default function SponsoredBanner({ sponsor, text, ctaLabel, ctaHref }: SponsoredBannerProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark px-5 py-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-caution">Sponsored · {sponsor}</p>
        <p className="mt-0.5 text-sm text-ink-soft dark:text-slate-300">{text}</p>
      </div>
      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
      >
        {ctaLabel}
      </a>
    </div>
  )
}
