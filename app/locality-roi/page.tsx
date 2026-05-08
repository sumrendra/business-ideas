'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { CITY_RENT_PROFILES, computeLocalityROI } from '@/lib/tools/rent-data'
import { CATEGORIES } from '@/lib/gap-engine/categories'

function fmtINR(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

interface ScanResult {
  id: string; label: string; icon: string
  demandScore: number; supplyCount: number; supplyScore: number; gapScore: number
  rating: 'high' | 'medium' | 'low' | 'saturated'
}

const RATING_STYLE = {
  high:      'text-emerald-600 dark:text-emerald-400 font-bold',
  medium:    'text-amber-600 dark:text-amber-400 font-semibold',
  low:       'text-slate-500 dark:text-slate-400',
  saturated: 'text-red-500 dark:text-red-400',
}

const ROI_BAND = (roi: number) => {
  if (roi >= 20) return { label: 'Exceptional', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' }
  if (roi >= 10) return { label: 'Strong', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' }
  if (roi >= 5)  return { label: 'Moderate', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' }
  return { label: 'Low', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' }
}

export default function LocalityROIPage() {
  const [cityId, setCityId]     = useState(CITY_RENT_PROFILES[0].cityId)
  const [categoryId, setCatId]  = useState(CATEGORIES[0].id)
  const [loading, setLoading]   = useState(false)
  const [scanResult, setScan]   = useState<ScanResult | null>(null)
  const [error, setError]       = useState('')

  const cityProfile  = CITY_RENT_PROFILES.find(c => c.cityId === cityId)!
  const categoryMeta = CATEGORIES.find(c => c.id === categoryId)!

  const analyze = useCallback(async () => {
    setLoading(true)
    setError('')
    setScan(null)
    try {
      const params = new URLSearchParams({ city: cityId, radius: '3000' })
      const res = await fetch(`/api/hyperlocal/scan?${params}`)
      if (!res.ok) throw new Error('Scan failed')
      const data = await res.json()
      const catResult = (data.results as ScanResult[]).find(r => r.id === categoryId)
      if (!catResult) throw new Error('Category not found in results')
      setScan(catResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [cityId, categoryId])

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Locality ROI</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Location Intelligence</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">Locality ROI Score</h1>
        <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
          Combines the real supply-demand gap score for your business category with commercial rent data across city zone types —
          so you can find the highest opportunity-per-rupee location.
        </p>
      </header>

      {/* Selector */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 mb-8">
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">City</label>
            <select
              value={cityId}
              onChange={e => { setCityId(e.target.value); setScan(null) }}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CITY_RENT_PROFILES.map(c => (
                <option key={c.cityId} value={c.cityId}>{c.cityName} (Tier {c.tier})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Business Category</label>
            <select
              value={categoryId}
              onChange={e => { setCatId(e.target.value); setScan(null) }}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={analyze}
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 text-sm transition-colors"
            >
              {loading ? 'Scanning…' : 'Analyze Location ROI →'}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          Clicking Analyze fetches a live supply-demand gap score for {categoryMeta?.label} in {cityProfile?.cityName} using Google Trends + Google Maps Places API, then combines it with rent data from Anarock/JLL reports.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      {/* Gap score result */}
      {scanResult && (
        <div className="mb-8 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/20 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">
            Live Gap Score — {categoryMeta.icon} {scanResult.label} in {cityProfile.cityName}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Demand Score', value: scanResult.demandScore },
              { label: 'Supply Score', value: scanResult.supplyScore },
              { label: 'Gap Score', value: scanResult.gapScore },
              { label: 'Competitors found', value: scanResult.supplyCount },
            ].map(m => (
              <div key={m.label} className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-indigo-100 dark:border-indigo-900/50">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">{m.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{m.value}</p>
              </div>
            ))}
          </div>
          <p className={`mt-3 text-sm font-semibold ${RATING_STYLE[scanResult.rating]}`}>
            Market rating: {scanResult.rating.charAt(0).toUpperCase() + scanResult.rating.slice(1)}
            {scanResult.rating === 'high' && ' — Strong opportunity across this city'}
            {scanResult.rating === 'medium' && ' — Moderate opportunity, location matters a lot'}
            {scanResult.rating === 'low' && ' — Low gap, need to find the right micro-location'}
            {scanResult.rating === 'saturated' && ' — Market appears saturated at city level'}
          </p>
        </div>
      )}

      {/* Zone ROI table */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-4">
          Zone ROI Table — {cityProfile.cityName}
          {scanResult ? ` (Gap Score: ${scanResult.gapScore})` : ' (Run analysis to compute ROI)'}
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">Zone Type</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600 hidden sm:table-cell">Example Areas</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">Rent / sqft</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">Monthly Rent<br /><span className="font-normal normal-case tracking-normal">(~{cityProfile.zones[0]?.typicalSqft || 400} sqft)</span></th>
                {scanResult && (
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">ROI Score</th>
                )}
              </tr>
            </thead>
            <tbody>
              {cityProfile.zones.map((zone, i) => {
                const roi = scanResult
                  ? computeLocalityROI(scanResult.gapScore, zone.rentMin, zone.rentMax, zone.typicalSqft)
                  : null
                const band = roi ? ROI_BAND((roi.roiMin + roi.roiMax) / 2) : null
                return (
                  <tr key={zone.zone} className={`border-b border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/40'}`}>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{zone.zone}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 hidden sm:table-cell max-w-xs">{zone.description}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                      ₹{zone.rentMin}–{zone.rentMax}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {roi ? (
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {fmtINR(roi.monthlyRentMin)}–{fmtINR(roi.monthlyRentMax)}/mo
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">
                          {fmtINR(zone.rentMin * zone.typicalSqft)}–{fmtINR(zone.rentMax * zone.typicalSqft)}/mo
                        </span>
                      )}
                    </td>
                    {scanResult && (
                      <td className="px-4 py-3 text-right">
                        {scanResult.gapScore === 0 ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-bold text-slate-400 dark:text-slate-600">—</span>
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400">Saturated</span>
                          </div>
                        ) : roi && band ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {roi.roiMin.toFixed(1)}–{roi.roiMax.toFixed(1)}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${band.cls}`}>{band.label}</span>
                          </div>
                        ) : null}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {scanResult && (
          <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-2">How to read this</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ROI Score = Gap Score ÷ (Monthly Rent / ₹10,000). A score of <strong>20</strong> means you get 20 points of market gap per ₹10K of monthly rent — significantly better value than a score of <strong>5</strong>.
              Higher scores in peripheral zones reflect cheap rent amplifying the gap opportunity. Lower scores in prime zones mean high rent is eating into the return.
              <strong> This is a directional guide — validate with a physical survey of the specific micro-location.</strong>
            </p>
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
        Rent data sourced from Anarock Commercial Report 2024, JLL India, and Knight Frank India. Ranges reflect ground-floor retail space. Gap scores from live Google Trends + Places API data.
      </p>
    </div>
  )
}
