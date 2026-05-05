import Link from 'next/link'

interface TrendData {
  monthly_values?: string
  direction?: 'Growing' | 'Stable' | 'Declining' | 'Seasonal'
  summary?: string
  peak_month?: string
}

interface Props {
  keyword: string
  trendsUrl: string
  trendData?: TrendData
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DIRECTION_STYLE = {
  Growing:   { dot: 'bg-green-500',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700' },
  Stable:    { dot: 'bg-blue-500',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700' },
  Declining: { dot: 'bg-red-500',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
  Seasonal:  { dot: 'bg-amber-500',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700' },
}

const DIRECTION_ARROW = { Growing: '↑', Stable: '→', Declining: '↓', Seasonal: '~' }

export default function TrendsChart({ keyword, trendsUrl, trendData }: Props) {
  const values = trendData?.monthly_values
    ? trendData.monthly_values.split(',').map(v => parseInt(v.trim(), 10)).filter(n => !isNaN(n))
    : []

  const direction = trendData?.direction ?? 'Stable'
  const style = DIRECTION_STYLE[direction] || DIRECTION_STYLE.Stable
  const arrow = DIRECTION_ARROW[direction]

  const max = Math.max(...values, 1)
  const current = values[values.length - 1] ?? 0
  const first = values[0] ?? 0
  const changePct = first > 0 ? Math.round(((current - first) / first) * 100) : 0

  // Show last 12 months — map to calendar month labels
  const now = new Date()
  const monthLabels = values.map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (values.length - 1 - i), 1)
    return MONTHS[d.getMonth()]
  })

  return (
    <Link href={trendsUrl} target="_blank" rel="noopener noreferrer" className="block group">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-indigo-300 hover:shadow-sm transition-all">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600">"{keyword}"</span>
              <span className="ml-1 text-xs text-slate-400">· India · 12 months</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style.badge}`}>
              {arrow} {direction}
            </span>
            <svg className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>

        {/* Bar chart */}
        {values.length > 0 && (
          <div className="px-5 pb-1">
            <div className="flex items-end gap-1 h-16">
              {values.map((v, i) => {
                const heightPx = Math.max(Math.round((v / max) * 56), 3)
                const isLast = i === values.length - 1
                const isPeak = v === max
                return (
                  <div key={i} className="flex flex-1 justify-center items-end h-full">
                    <div
                      className={`w-full rounded-sm ${
                        isPeak ? 'bg-indigo-500' : isLast ? 'bg-indigo-400' : 'bg-indigo-200'
                      }`}
                      style={{ height: heightPx }}
                    />
                  </div>
                )
              })}
            </div>
            {/* Month labels — show every 3rd */}
            <div className="flex gap-1 mt-1">
              {monthLabels.map((m, i) => (
                <div key={i} className="flex-1 text-center">
                  {i % 3 === 0 && (
                    <span className="text-[9px] text-slate-400">{m}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer stats */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-slate-100 px-5 py-2.5">
          <div>
            <span className="text-xs text-slate-400">Interest now </span>
            <span className="text-xs font-bold text-slate-700">{current}/100</span>
          </div>
          <div>
            <span className="text-xs text-slate-400">12-month change </span>
            <span className={`text-xs font-bold ${changePct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {changePct >= 0 ? '+' : ''}{changePct}%
            </span>
          </div>
          {trendData?.peak_month && (
            <div>
              <span className="text-xs text-slate-400">Peak season </span>
              <span className="text-xs font-semibold text-slate-600">{trendData.peak_month}</span>
            </div>
          )}
          {trendData?.summary && (
            <p className="w-full text-xs text-slate-500 italic">{trendData.summary}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
