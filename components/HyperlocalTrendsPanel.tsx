'use client'

import { useState, useEffect } from 'react'

const LINE_COLORS = [
  { stroke: '#6366f1', fill: 'rgba(99,102,241,0.13)',  dot: 'bg-indigo-500', label: 'text-indigo-600 dark:text-indigo-400' },
  { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.10)',  dot: 'bg-amber-500',  label: 'text-amber-600 dark:text-amber-400'  },
  { stroke: '#10b981', fill: 'rgba(16,185,129,0.10)', dot: 'bg-emerald-500', label: 'text-emerald-600 dark:text-emerald-400' },
]

interface LineState {
  keyword: string
  values: number[]
  labels: string[]
  loading: boolean
  failed: boolean
}

function trendDir(values: number[]): { arrow: string; cls: string } {
  if (values.length < 6) return { arrow: '→', cls: 'text-slate-400' }
  const recent = values.slice(-6)
  const older  = values.slice(-18, -12)
  const avg    = (a: number[]) => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0
  const r = avg(recent); const o = avg(older)
  if (o > 0 && r / o > 1.2)  return { arrow: '↑', cls: 'text-emerald-600 dark:text-emerald-400' }
  if (o > 0 && r / o < 0.85) return { arrow: '↓', cls: 'text-rose-500 dark:text-rose-400' }
  return { arrow: '→', cls: 'text-slate-400 dark:text-slate-500' }
}

function MultiLineChart({ lines }: { lines: LineState[] }) {
  const W = 600; const H = 88
  const PAD = { t: 6, r: 4, b: 18, l: 4 }
  const active = lines.filter(l => !l.loading && !l.failed && l.values.length > 1)
  if (!active.length) return null

  const maxVal = Math.max(...active.flatMap(l => l.values), 1)
  const refLen = active[0].values.length
  const x = (i: number, tot: number) => PAD.l + (i / Math.max(tot - 1, 1)) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - v / maxVal) * (H - PAD.t - PAD.b)

  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        style={{ height: 88 }}
        preserveAspectRatio="none"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          {active.map((_, ci) => (
            <linearGradient key={ci} id={`htg${ci}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LINE_COLORS[ci].stroke} stopOpacity="0.25" />
              <stop offset="100%" stopColor={LINE_COLORS[ci].stroke} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid lines */}
        {[25, 50, 75].map(v => (
          <line key={v}
            x1={PAD.l} y1={y(v)} x2={W - PAD.r} y2={y(v)}
            stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.5"
            className="text-slate-500"
          />
        ))}

        {/* Lines + fills */}
        {active.map((line, ci) => {
          const vals = line.values; const tot = vals.length
          let d = `M ${x(0, tot)} ${y(vals[0])}`
          for (let i = 1; i < tot; i++) {
            const cpx = (x(i - 1, tot) + x(i, tot)) / 2
            d += ` C ${cpx} ${y(vals[i - 1])}, ${cpx} ${y(vals[i])}, ${x(i, tot)} ${y(vals[i])}`
          }
          const area = `${d} L ${x(tot - 1, tot)} ${H - PAD.b} L ${x(0, tot)} ${H - PAD.b} Z`
          return (
            <g key={ci}>
              <path d={area} fill={`url(#htg${ci})`} />
              <path d={d} fill="none" stroke={LINE_COLORS[ci].stroke}
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                vectorEffect="non-scaling-stroke" />
            </g>
          )
        })}

        {/* Hover crosshair + dots */}
        {hoverIdx !== null && active.map((line, ci) => {
          const vals = line.values; const tot = vals.length
          const i = Math.round((hoverIdx / (refLen - 1)) * (tot - 1))
          const v = vals[Math.min(i, vals.length - 1)] ?? 0
          return (
            <circle key={ci} cx={x(hoverIdx, refLen)} cy={y(v)} r="3"
              fill={LINE_COLORS[ci].stroke} vectorEffect="non-scaling-stroke" />
          )
        })}
        {hoverIdx !== null && (
          <line
            x1={x(hoverIdx, refLen)} y1={PAD.t}
            x2={x(hoverIdx, refLen)} y2={H - PAD.b}
            stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Hover targets (invisible wide columns) */}
        {active[0]?.values.map((_, i) => (
          <rect key={i}
            x={x(i, refLen) - (W / refLen) / 2} y={PAD.t}
            width={W / refLen} height={H - PAD.t - PAD.b}
            fill="transparent"
            className="cursor-crosshair"
            onMouseEnter={() => setHoverIdx(i)}
          />
        ))}

        {/* X axis year labels */}
        {active[0]?.labels.map((label, i) => {
          const tot = active[0].labels.length
          if (i % 12 !== 0) return null
          return (
            <text key={i} x={x(i, tot)} y={H - 2} textAnchor="middle" fontSize="7.5" fill="#94a3b8">
              {label.split(' ')[1]}
            </text>
          )
        })}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && (
        <div className="pointer-events-none absolute left-2 top-0 bg-slate-800/90 text-white rounded-lg px-2 py-1.5 text-[10px] space-y-0.5 shadow-lg z-10">
          <p className="text-slate-400 text-[9px]">{active[0]?.labels[hoverIdx]}</p>
          {active.map((line, ci) => {
            const tot = line.values.length
            const i = Math.round((hoverIdx / (refLen - 1)) * (tot - 1))
            const v = line.values[Math.min(i, tot - 1)] ?? 0
            return (
              <div key={ci} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LINE_COLORS[ci].stroke }} />
                <span className="truncate max-w-[120px] text-slate-300">{line.keyword}</span>
                <span className="font-bold ml-auto pl-2">{v}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface Props {
  keywords: string[]  // category.trendsKeywords — up to 3
  stateCode: string   // e.g. 'RJ' for Rajasthan
  stateName: string   // e.g. 'Rajasthan'
}

export default function HyperlocalTrendsPanel({ keywords, stateCode, stateName }: Props) {
  const geo  = `IN-${stateCode}`
  const kws  = keywords.slice(0, 3)

  const [lines, setLines] = useState<LineState[]>(
    kws.map(kw => ({ keyword: kw, values: [], labels: [], loading: true, failed: false }))
  )

  useEffect(() => {
    setLines(kws.map(kw => ({ keyword: kw, values: [], labels: [], loading: true, failed: false })))

    kws.forEach((kw, i) => {
      const params = new URLSearchParams({ keyword: kw, geo, period: '5y' })
      fetch(`/api/trends?${params}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          if (!data.values?.length || data.rateLimited) {
            setLines(prev => prev.map((l, li) => li === i ? { ...l, loading: false, failed: true } : l))
          } else {
            setLines(prev => prev.map((l, li) =>
              li === i ? { ...l, loading: false, failed: false, values: data.values, labels: data.labels } : l
            ))
          }
        })
        .catch(() =>
          setLines(prev => prev.map((l, li) => li === i ? { ...l, loading: false, failed: true } : l))
        )
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kws.join('|'), geo])

  const anyLoading = lines.some(l => l.loading)
  const hasData    = lines.some(l => !l.loading && !l.failed && l.values.length > 0)

  return (
    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Search demand</p>
        <span className="text-[9px] text-slate-400 dark:text-slate-500">{stateName} · 5yr</span>
      </div>

      {anyLoading && (
        <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-2 space-y-1.5 animate-pulse">
          <div className="h-[88px] bg-slate-100 dark:bg-slate-800 rounded" />
          {kws.map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded flex-1" />
            </div>
          ))}
        </div>
      )}

      {!anyLoading && hasData && (
        <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 pt-2 pb-1.5 overflow-hidden">
          <MultiLineChart lines={lines} />
          <div className="mt-1.5 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-1.5">
            {lines.map((line, i) => {
              const { arrow, cls } = trendDir(line.values)
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${LINE_COLORS[i].dot}`} />
                  <span className="flex-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">{line.keyword}</span>
                  {line.failed
                    ? <span className="text-[9px] text-slate-300 dark:text-slate-600 shrink-0">no data</span>
                    : <span className={`text-[10px] font-bold shrink-0 ${cls}`}>{arrow}</span>
                  }
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!anyLoading && !hasData && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center py-2">
          No trends data for {stateName}
        </p>
      )}
    </div>
  )
}
