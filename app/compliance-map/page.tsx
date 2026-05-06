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
  central: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  state:   'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  local:   'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
}

function LicenseCard({ lic, index }: { lic: License; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-xl border transition-colors ${lic.mandatory ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900' : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <span className="mt-0.5 text-slate-400 dark:text-slate-600 font-mono text-sm w-5 shrink-0">{index + 1}.</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{lic.name}</p>
            {lic.mandatory && (
              <span className="rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">Mandatory</span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${LEVEL_COLORS[lic.level]}`}>
              {lic.level.charAt(0).toUpperCase() + lic.level.slice(1)}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{lic.authority}</p>
        </div>
        <div className="text-right shrink-0 ml-2">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {lic.feeMin === 0 && lic.feeMax === 0 ? 'Free' : `${fmtINR(lic.feeMin)}${lic.feeMin !== lic.feeMax ? `–${fmtINR(lic.feeMax)}` : ''}`}
          </p>
          <p className="text-[10px] text-slate-400">{lic.processingDays === 0 ? 'Instant' : `~${lic.processingDays}d`}</p>
        </div>
        <span className="text-slate-400 mt-0.5 ml-1">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 ml-8 space-y-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-3">{lic.notes}</p>
          {lic.renewalYears > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-500">
              <span className="font-medium">Renewal:</span> Every {lic.renewalYears} year{lic.renewalYears > 1 ? 's' : ''}
            </p>
          )}
          {lic.link && (
            <a href={lic.link} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1">
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
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Compliance Map</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Regulatory</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">License & Compliance Map</h1>
        <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
          Every license you need, what it costs, and how long it takes — for 9 common Indian business types.
          Data verified against official portals (MCA, FSSAI, CDSCO, PCPCB) as of 2024.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Business type selector */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-3">Select Business Type</p>
          {BUSINESS_TYPES.map(bt => (
            <button
              key={bt.id}
              onClick={() => setSelected(bt)}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                selected.id === bt.id
                  ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="text-xl">{bt.icon}</span>
              <span className={`text-sm font-medium ${selected.id === bt.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                {bt.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div>
          {/* Header card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 mb-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{selected.icon}</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selected.label}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selected.description}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Setup Cost (est.)</p>
                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{fmtINR(totalCost.min)}–{fmtINR(totalCost.max)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">License Fees</p>
                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{fmtINR(mandatoryFeeMin)}–{fmtINR(mandatoryFeeMax)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Processing Time</p>
                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">~{processingDays} days</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Mandatory Licenses</p>
                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{mandatoryLicenses.length} of {selected.licenses.length}</p>
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
            <span className="rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-2.5 py-0.5 font-bold uppercase tracking-wide">Mandatory</span>
          </div>

          {/* Mandatory licenses */}
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-3">Mandatory Licenses</p>
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
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-3 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
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

      <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-600">
        Fees and timelines verified as of 2024. State-level variations apply — confirm exact fees at your state portal before applying. This is guidance, not legal advice.
      </p>
    </div>
  )
}
