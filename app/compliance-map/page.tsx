'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BUSINESS_TYPES, getTotalCost, getMandatoryLicenses, getTotalProcessingDays,
  type BusinessType, type License,
} from '@/lib/tools/compliance-data'

function fmtINR(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

const LEVEL_COLORS: Record<License['level'], string> = {
  central: 'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-slate-300',
  state:   'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-slate-300',
  local:   'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-slate-300',
}

function LicenseCard({ lic, index }: { lic: License; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-xl border transition-shadow hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)] ${lic.mandatory ? 'border-line dark:border-line-dark bg-surface dark:bg-surface-dark' : 'border-dashed border-line dark:border-line-dark bg-surface-sunk/50 dark:bg-surface-dark/50'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <span className="mt-0.5 text-ink-soft dark:text-slate-600 font-mono text-sm w-5 shrink-0 tabular-nums">{index + 1}.</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm text-ink dark:text-slate-200">{lic.name}</p>
            {lic.mandatory && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-sunk dark:bg-surface-dark-raised text-alert px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-alert" />Mandatory
              </span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${LEVEL_COLORS[lic.level]}`}>
              {lic.level.charAt(0).toUpperCase() + lic.level.slice(1)}
            </span>
          </div>
          <p className="text-xs text-ink-soft dark:text-slate-500 mt-0.5">{lic.authority}</p>
        </div>
        <div className="text-right shrink-0 ml-2">
          <p className="text-sm font-bold text-ink dark:text-slate-300 tabular-nums">
            {lic.feeMin === 0 && lic.feeMax === 0 ? 'Free' : `${fmtINR(lic.feeMin)}${lic.feeMin !== lic.feeMax ? `–${fmtINR(lic.feeMax)}` : ''}`}
          </p>
          <p className="text-[10px] text-ink-soft tabular-nums">{lic.processingDays === 0 ? 'Instant' : `~${lic.processingDays}d`}</p>
        </div>
        <span className="text-ink-soft mt-0.5 ml-1">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 ml-8 space-y-2 border-t border-line dark:border-line-dark">
          <p className="text-xs text-ink-soft dark:text-slate-400 leading-relaxed mt-3">{lic.notes}</p>
          {lic.renewalYears > 0 && (
            <p className="text-xs text-ink-soft dark:text-slate-500 tabular-nums">
              <span className="font-medium">Renewal:</span> Every {lic.renewalYears} year{lic.renewalYears > 1 ? 's' : ''}
            </p>
          )}
          {lic.link && (
            <a href={lic.link} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-brand-600 dark:text-brand-500 hover:underline mt-1">
              Apply online →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default function ComplianceMapPage() {
  const [selected, setSelected] = useState<BusinessType>(BUSINESS_TYPES[0])
  const [showOptional, setShowOptional] = useState(false)

  const mandatoryLicenses = useMemo(() => getMandatoryLicenses(selected), [selected])
  const optionalLicenses  = useMemo(() => selected.licenses.filter(l => !l.mandatory), [selected])
  const totalCost         = useMemo(() => getTotalCost(selected), [selected])
  const processingDays    = useMemo(() => getTotalProcessingDays(mandatoryLicenses), [mandatoryLicenses])

  const mandatoryFeeMin = mandatoryLicenses.reduce((s, l) => s + l.feeMin, 0)
  const mandatoryFeeMax = mandatoryLicenses.reduce((s, l) => s + l.feeMax, 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <nav className="mb-6 text-sm text-ink-soft dark:text-slate-400">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-500">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-brand-600 dark:hover:text-brand-500">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-ink dark:text-slate-300">Compliance Map</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-500">Regulatory</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-ink dark:text-slate-100">License & Compliance Map</h1>
        <p className="mt-2 max-w-2xl text-ink-soft dark:text-slate-400">
          Every license you need, what it costs, and how long it takes — for 9 common Indian business types.
          Data verified against official portals (MCA, FSSAI, CDSCO, PCPCB) as of 2024.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Business type selector */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-soft dark:text-slate-600 mb-3">Select Business Type</p>
          {BUSINESS_TYPES.map(bt => (
            <button
              key={bt.id}
              onClick={() => setSelected(bt)}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left min-h-[44px] transition-colors ${
                selected.id === bt.id
                  ? 'border-brand-600 dark:border-brand-600 bg-brand-50 dark:bg-brand-600/10'
                  : 'border-line dark:border-line-dark bg-surface dark:bg-surface-dark hover:border-ink-soft dark:hover:border-ink-soft'
              }`}
            >
              <span className="text-xl">{bt.icon}</span>
              <span className={`text-sm font-medium ${selected.id === bt.id ? 'text-brand-700 dark:text-brand-500' : 'text-ink dark:text-slate-300'}`}>
                {bt.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div>
          {/* Header card */}
          <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6 mb-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{selected.icon}</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-ink dark:text-slate-100">{selected.label}</h2>
                <p className="text-sm text-ink-soft dark:text-slate-400 mt-1">{selected.description}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-surface-sunk dark:bg-surface-dark-raised p-3">
                <p className="text-[10px] uppercase tracking-wider text-ink-soft dark:text-slate-500">Setup Cost (est.)</p>
                <p className="mt-1 text-sm font-bold text-ink dark:text-slate-200 tabular-nums">{fmtINR(totalCost.min)}–{fmtINR(totalCost.max)}</p>
              </div>
              <div className="rounded-xl bg-surface-sunk dark:bg-surface-dark-raised p-3">
                <p className="text-[10px] uppercase tracking-wider text-ink-soft dark:text-slate-500">License Fees</p>
                <p className="mt-1 text-sm font-bold text-ink dark:text-slate-200 tabular-nums">{fmtINR(mandatoryFeeMin)}–{fmtINR(mandatoryFeeMax)}</p>
              </div>
              <div className="rounded-xl bg-surface-sunk dark:bg-surface-dark-raised p-3">
                <p className="text-[10px] uppercase tracking-wider text-ink-soft dark:text-slate-500">Processing Time</p>
                <p className="mt-1 text-sm font-bold text-ink dark:text-slate-200 tabular-nums">~{processingDays} days</p>
              </div>
              <div className="rounded-xl bg-surface-sunk dark:bg-surface-dark-raised p-3">
                <p className="text-[10px] uppercase tracking-wider text-ink-soft dark:text-slate-500">Mandatory Licenses</p>
                <p className="mt-1 text-sm font-bold text-ink dark:text-slate-200 tabular-nums">{mandatoryLicenses.length} of {selected.licenses.length}</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4 text-[11px]">
            {[
              { label: 'Central (GOI)', cls: LEVEL_COLORS.central },
              { label: 'State Govt', cls: LEVEL_COLORS.state },
              { label: 'Local / Municipal', cls: LEVEL_COLORS.local },
            ].map(l => (
              <span key={l.label} className={`rounded-full px-2.5 py-0.5 font-medium ${l.cls}`}>{l.label}</span>
            ))}
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-sunk dark:bg-surface-dark-raised text-alert px-2.5 py-0.5 font-bold uppercase tracking-wide">
              <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-alert" />Mandatory
            </span>
          </div>

          {/* Mandatory licenses */}
          <p className="text-xs font-bold uppercase tracking-widest text-ink-soft dark:text-slate-600 mb-3">Mandatory Licenses</p>
          <div className="space-y-3 mb-6">
            {mandatoryLicenses.map((lic, i) => (
              <LicenseCard key={lic.id} lic={lic} index={i} />
            ))}
          </div>

          {/* Optional licenses */}
          {optionalLicenses.length > 0 && (
            <>
              <button
                onClick={() => setShowOptional(o => !o)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink-soft dark:text-slate-600 mb-3 hover:text-ink dark:hover:text-slate-400 transition-colors"
              >
                <span>{showOptional ? '▼' : '▶'}</span>
                Optional / Conditional Licenses ({optionalLicenses.length})
              </button>
              {showOptional && (
                <div className="space-y-3">
                  {optionalLicenses.map((lic, i) => (
                    <LicenseCard key={lic.id} lic={lic} index={mandatoryLicenses.length + i} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-caution">
        Fees and timelines verified as of 2024. State-level variations apply — confirm exact fees at your state portal before applying. This is guidance, not legal advice.
      </p>
    </div>
  )
}
