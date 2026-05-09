'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import Map, {
  Source,
  Layer,
  Popup,
  Marker,
  NavigationControl,
  type MapRef,
  type MapLayerMouseEvent,
  type LayerProps,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CITIES, TIER_LABELS, type PopulationTier } from '@/lib/gap-engine/cities'
import { CATEGORIES } from '@/lib/gap-engine/categories'
import { CITY_RENT_PROFILES, computeLocalityROI } from '@/lib/tools/rent-data'
import HyperlocalTrendsPanel from '@/components/HyperlocalTrendsPanel'

// ─── CARTO free tile styles ────────────────────────────────────────────────────
const STYLE_LIGHT = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
const STYLE_DARK  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const e = (v: unknown) => v as any

// ─── H3 hex fill — coloured by opportunityScore (0=red, 100=green) ────────────
const hexFillLayer: LayerProps = {
  id: 'hex-fill',
  type: 'fill',
  paint: {
    'fill-color': e(['interpolate', ['linear'], ['get', 'opportunityScore'],
      0,  '#ef4444',   // red   = saturated
      20, '#fb923c',   // orange
      40, '#fbbf24',   // amber
      60, '#4ade80',   // light green
      80, '#16a34a',   // dark green = high opportunity
    ]),
    'fill-opacity': e(['interpolate', ['linear'], ['get', 'demandScore'],
      0, 0, 8, 0.12, 25, 0.52, 60, 0.72, 100, 0.85,
    ]),
  },
}

const hexOutlineLayer: LayerProps = {
  id: 'hex-outline',
  type: 'line',
  paint: {
    'line-color': 'rgba(255,255,255,0.22)',
    'line-width': 0.7,
  },
}

// ─── Supply clusters ───────────────────────────────────────────────────────────
const clusterCircleLayer: LayerProps = {
  id: 'supply-clusters',
  type: 'circle',
  filter: e(['has', 'point_count']),
  paint: {
    'circle-color': e(['step', ['get', 'point_count'], '#6366f1', 5, '#4f46e5', 10, '#3730a3']),
    'circle-radius': e(['step', ['get', 'point_count'], 16, 5, 22, 10, 30]),
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff',
    'circle-opacity': 0.9,
  },
}

const clusterCountLayer: LayerProps = {
  id: 'supply-cluster-count',
  type: 'symbol',
  filter: e(['has', 'point_count']),
  layout: {
    'text-field': e('{point_count_abbreviated}'),
    'text-font': ['Open Sans Bold'],
    'text-size': 12,
  },
  paint: { 'text-color': '#ffffff' },
}

const pointLayer: LayerProps = {
  id: 'supply-point',
  type: 'circle',
  filter: e(['!', ['has', 'point_count']]),
  paint: {
    'circle-color': e(['interpolate', ['linear'], ['get', 'rating'],
      0, '#818cf8', 3, '#6366f1', 4, '#4f46e5', 5, '#312e81',
    ]),
    'circle-radius': e(['interpolate', ['linear'], ['get', 'userRatingsTotal'],
      0, 5, 50, 7, 500, 9, 2000, 12,
    ]),
    'circle-stroke-width': 1.5,
    'circle-stroke-color': '#fff',
    'circle-opacity': 0.9,
  },
}

// ─── Zone marker colours (Prime → Secondary → Suburban → Peripheral) ──────────
const ZONE_COLORS = [
  { dot: 'bg-rose-500',    marker: 'bg-rose-600',    border: 'border-rose-700'    },
  { dot: 'bg-amber-500',   marker: 'bg-amber-500',   border: 'border-amber-600'   },
  { dot: 'bg-sky-500',     marker: 'bg-sky-600',     border: 'border-sky-700'     },
  { dot: 'bg-emerald-500', marker: 'bg-emerald-600', border: 'border-emerald-700' },
]

const ROI_BAND = (roi: number) => {
  if (roi >= 20) return { label: 'Exceptional', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' }
  if (roi >= 10) return { label: 'Strong',      cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' }
  if (roi >= 5)  return { label: 'Moderate',    cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' }
  return           { label: 'Low',          cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' }
}

function fmtINR(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface HexProperties {
  demandScore: number
  supplyScore: number
  gapScore: number
  opportunityScore: number
  supplyCount: number
  osmCount: number
  avgRating: number
  totalReviews: number
  avgFootfall: number
  distKm: number
}

interface PointProperties {
  name: string
  vicinity: string
  rating: number
  userRatingsTotal: number
}

interface Stats {
  demandScore: number
  supplyScore: number
  gapScore: number
  rating: 'high' | 'medium' | 'low' | 'saturated'
  stateScore: number
  cityScore: number
  purchasingPower: number
  supplyCount: number
  googleCount: number
  textSearchCount: number
  umbrellaCount: number
  multilingualCount: number
  osmCount: number
  avgRating: number
  totalReviews: number
  trendDirection: 'growing' | 'stable' | 'declining'
  trendChangePercent: number
  totalHexes: number
  opportunityHexes: number
  highOpportunityHexes: number
  avgHexDemand: number
  avgHexSupply: number
  udyamDensity: number
  formalBusinessIndex: number
  radius: number
}

interface ScanResult {
  id: string
  label: string
  icon: string
  demandScore: number
  supplyCount: number
  supplyScore: number
  gapScore: number
  rating: 'high' | 'medium' | 'low' | 'saturated'
}

type PopupData =
  | { kind: 'hex'; lat: number; lng: number; props: HexProperties }
  | { kind: 'point'; lat: number; lng: number; props: PointProperties }
  | { kind: 'cluster'; lat: number; lng: number; count: number }

const RATING_META = {
  high:      { label: 'High Opportunity',    color: 'text-green-600  dark:text-green-400',  bar: 'bg-green-500',  dot: 'bg-green-500'  },
  medium:    { label: 'Moderate Opportunity', color: 'text-amber-600  dark:text-amber-400',  bar: 'bg-amber-400',  dot: 'bg-amber-500'  },
  low:       { label: 'Low Gap',             color: 'text-slate-600  dark:text-slate-300',  bar: 'bg-slate-400',  dot: 'bg-slate-400'  },
  saturated: { label: 'Saturated Market',    color: 'text-rose-600   dark:text-rose-400',   bar: 'bg-rose-500',   dot: 'bg-rose-500'   },
}

const TIER_ORDER: PopulationTier[] = ['metro', 'tier1', 'tier2', 'tier3']
const RADIUS_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '3 km', value: 3000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
]

const TREND_META = {
  growing:   { label: '↑ Growing',   color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800' },
  stable:    { label: '→ Stable',    color: 'text-slate-600 dark:text-slate-300',  bg: 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'  },
  declining: { label: '↓ Declining', color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'       },
}

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
function ScoreRow({ label, value, color, max = 100 }: { label: string; value: number; color: string; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[11px] text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="w-7 text-right text-[11px] font-semibold text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  if (!rating) return null
  return (
    <span className="text-amber-400 font-semibold text-xs">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))} {rating.toFixed(1)}
    </span>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function HyperlocalMap() {
  const mapRef     = useRef<MapRef>(null)
  const [darkMode] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const [cityId,       setCityId]       = useState('')
  const [catId,        setCatId]        = useState('')
  const [customQuery,  setCustomQuery]  = useState('')
  const [customInput,  setCustomInput]  = useState('')
  const [radius,       setRadius]       = useState(3000)
  const [tierFilter,   setTierFilter]   = useState<PopulationTier | 'all'>('all')
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number } | null>(null)

  const [hexGeo,      setHexGeo]      = useState<GeoJSON.FeatureCollection | null>(null)
  const [supplyGeo,   setSupplyGeo]   = useState<GeoJSON.FeatureCollection | null>(null)
  const [stats,       setStats]       = useState<Stats | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [scanning,    setScanning]    = useState(false)

  const [showHex,    setShowHex]    = useState(true)
  const [showSupply, setShowSupply] = useState(true)
  const [showZones,  setShowZones]  = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [popup,      setPopup]      = useState<PopupData | null>(null)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)

  const filteredCities = tierFilter === 'all' ? CITIES : CITIES.filter(c => c.tier === tierFilter)

  // Rent profile for selected city (only ~10 major cities have one)
  const rentProfile = useMemo(
    () => CITY_RENT_PROFILES.find(c => c.cityId === cityId) ?? null,
    [cityId]
  )

  // Pre-compute ROI for each zone whenever stats or city changes
  const zoneROIs = useMemo(() => {
    if (!rentProfile) return null
    return rentProfile.zones.map((zone, i) => {
      const roi = stats ? computeLocalityROI(stats.gapScore, zone.rentMin, zone.rentMax, zone.typicalSqft) : null
      const avgROI = roi ? (roi.roiMin + roi.roiMax) / 2 : null
      return { ...zone, idx: i, roi, band: avgROI !== null ? ROI_BAND(avgROI) : null }
    })
  }, [rentProfile, stats])

  const isCustomMode = !catId && !!customQuery

  const analyse = useCallback(async () => {
    if (!cityId || (!catId && !customQuery)) return
    setLoading(true)
    setError(null)
    setPopup(null)
    try {
      const params = new URLSearchParams({ city: cityId, radius: String(radius) })
      if (customQuery && !catId) {
        params.set('customQuery', customQuery)
      } else {
        params.set('category', catId)
      }
      if (searchCenter) {
        params.set('centerLat', String(searchCenter.lat))
        params.set('centerLng', String(searchCenter.lng))
      }
      const res = await fetch(`/api/hyperlocal?${params}`)
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`)
      const data = await res.json()
      setHexGeo(data.hexGeoJSON)
      setSupplyGeo(data.supplyGeoJSON)
      setStats(data.stats)
      const flyTarget = data.searchCenter ?? data.city
      mapRef.current?.flyTo({ center: [flyTarget.lng, flyTarget.lat], zoom: 13, duration: 1400, essential: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [cityId, catId, customQuery, radius, searchCenter])

  const scanAll = useCallback(async () => {
    if (!cityId) return
    setScanning(true)
    setScanResults([])
    try {
      const params = new URLSearchParams({ city: cityId, radius: String(radius) })
      if (searchCenter) {
        params.set('centerLat', String(searchCenter.lat))
        params.set('centerLng', String(searchCenter.lng))
      }
      const res = await fetch(`/api/hyperlocal/scan?${params}`)
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`)
      const data = await res.json()
      setScanResults(data.results)
    } catch {
      // silently ignore — scan is non-critical
    } finally {
      setScanning(false)
    }
  }, [cityId, radius, searchCenter])

  // Auto re-analyse when searchCenter moves (only if a result is already loaded)
  const isFirstCenter = useRef(true)
  useEffect(() => {
    if (!searchCenter) return
    if (isFirstCenter.current) { isFirstCenter.current = false; return }
    if (!hexGeo) return   // no initial analysis yet — wait for manual Analyse click
    analyse()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCenter])

  // Click handler:
  //   supply point / cluster → show popup only (no pin move)
  //   hex or empty area      → move pin (triggers re-analysis) + show hex popup if applicable
  const onClick = useCallback((e: MapLayerMouseEvent) => {
    if (!cityId) return

    const f = e.features?.[0]
    const id = f?.layer?.id

    // Supply markers — popup only, never move the pin
    if (id === 'supply-point') {
      const coords = (f!.geometry as GeoJSON.Point).coordinates
      setPopup({ kind: 'point', lat: coords[1], lng: coords[0], props: f!.properties as PointProperties })
      return
    }
    if (id === 'supply-clusters') {
      const coords = (f!.geometry as GeoJSON.Point).coordinates
      setPopup({ kind: 'cluster', lat: coords[1], lng: coords[0], count: (f!.properties as { point_count: number }).point_count })
      return
    }

    // Hex or empty area — move the search pin
    setSearchCenter({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    if (id === 'hex-fill' || id === 'hex-outline') {
      setPopup({ kind: 'hex', lat: e.lngLat.lat, lng: e.lngLat.lng, props: f!.properties as HexProperties })
    } else {
      setPopup(null)
    }
  }, [cityId])

  const ratingMeta = stats ? RATING_META[stats.rating] : null
  const trendMeta  = stats ? TREND_META[stats.trendDirection] : null
  const catInfo    = isCustomMode
    ? (customQuery ? { trendsKeywords: [customQuery] } : null)
    : CATEGORIES.find(c => c.id === catId)

  return (
    <div className="relative flex h-[84vh] min-h-[540px] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className={`relative z-10 flex flex-col bg-white/96 dark:bg-slate-900/96 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'w-72 min-w-[17rem]' : 'w-0 overflow-hidden'}`}>
        <div className="p-4 space-y-4 min-w-[17rem]">

          {/* Title */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Hyperlocal Opportunity + ROI</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">Configure analysis</p>
          </div>

          {/* Tier filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">City tier</label>
            <div className="flex flex-wrap gap-1">
              {(['all', ...TIER_ORDER] as const).map(t => (
                <button key={t} onClick={() => { setTierFilter(t); setCityId('') }}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border transition-colors ${tierFilter === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'}`}>
                  {t === 'all' ? 'All' : TIER_LABELS[t].split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">City</label>
            <select value={cityId} onChange={e => { setCityId(e.target.value); setSearchCenter(null); setScanResults([]) }}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select city…</option>
              {filteredCities.map(c => <option key={c.id} value={c.id}>{c.name} — {c.state}</option>)}
            </select>
          </div>

          {/* Custom search */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Custom search</label>
            <form
              onSubmit={e => {
                e.preventDefault()
                const q = customInput.trim()
                if (!q) return
                setCustomQuery(q)
                setCatId('')
              }}
              className="flex gap-1.5"
            >
              <input
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="e.g. korean spa, art store…"
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
              >
                Go
              </button>
            </form>
            {isCustomMode && (
              <div className="flex items-center justify-between rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1.5">
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 truncate">🔍 {customQuery}</span>
                <button
                  onClick={() => { setCustomQuery(''); setCustomInput('') }}
                  className="shrink-0 ml-2 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {isCustomMode ? 'Or pick a preset' : 'Category'}
            </label>
            <div className="space-y-0.5">
              {CATEGORIES.map(cat => {
                const selected = !isCustomMode && catId === cat.id
                return (
                  <button key={cat.id} onClick={() => { setCatId(cat.id); setCustomQuery(''); setCustomInput('') }}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors border ${
                      selected
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}>
                    <span className={`w-3.5 h-3.5 rounded shrink-0 border flex items-center justify-center transition-colors ${
                      selected
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}>
                      {selected && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Search demand trends — appears once a category is selected */}
          {cityId && (catId || customQuery) && (() => {
            const city = CITIES.find(c => c.id === cityId)
            if (!city) return null
            const keywords = customQuery && !catId
              ? [customQuery]
              : CATEGORIES.find(c => c.id === catId)?.trendsKeywords ?? []
            if (!keywords.length) return null
            return (
              <HyperlocalTrendsPanel
                keywords={keywords}
                stateCode={city.stateCode}
                stateName={city.state}
              />
            )
          })()}

          {/* Radius */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Supply search radius</label>
            <div className="flex gap-1.5">
              {RADIUS_OPTIONS.map(r => (
                <button key={r.value} onClick={() => setRadius(r.value)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors ${radius === r.value ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom centre indicator + reset */}
          {searchCenter ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-indigo-500 text-sm shrink-0">📍</span>
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 truncate">Custom pin set</span>
              </div>
              <button onClick={() => setSearchCenter(null)}
                className="shrink-0 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 underline">
                Reset
              </button>
            </div>
          ) : cityId ? (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
              Click anywhere on the map to move the search pin
            </p>
          ) : null}

          {/* Analyse */}
          <button onClick={analyse} disabled={!cityId || (!catId && !customQuery) || loading}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? 'Analysing…' : 'Analyse →'}
          </button>

          {error && <p className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

          {/* Scan all categories */}
          {cityId && (
            <button onClick={scanAll} disabled={scanning || loading}
              className="w-full rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 disabled:opacity-40 transition-colors">
              {scanning ? '⏳ Scanning all categories…' : '⚡ Scan All Categories'}
            </button>
          )}

          {/* Ranked scan results */}
          {scanResults.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-1">
                All {scanResults.length} categories ranked
              </p>
              {scanResults.map((r, i) => {
                const meta = RATING_META[r.rating]
                return (
                  <button key={r.id} onClick={() => setCatId(r.id)}
                    className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors border ${
                      catId === r.id
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                        : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700 bg-white dark:bg-slate-900/40'
                    }`}>
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 w-4 shrink-0 text-right">{i + 1}</span>
                    <span className="text-sm shrink-0">{r.icon}</span>
                    <span className="flex-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight truncate">{r.label}</span>
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">{r.supplyCount}↓</span>
                      <span className={`text-xs font-black ${meta.color}`}>{r.gapScore}</span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                    </div>
                  </button>
                )
              })}
              <p className="text-[9px] text-slate-400 dark:text-slate-600 pt-1">
                Gap score = demand − supply · click to deep-analyse
              </p>
            </div>
          )}

          {/* Layer toggles */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Layers</p>
            {[
              { key: 'hex',    label: 'Opportunity hex grid', color: 'bg-gradient-to-r from-red-400 via-amber-400 to-green-500', state: showHex,    toggle: setShowHex },
              { key: 'supply', label: 'Supply businesses',    color: 'bg-indigo-500',                                            state: showSupply, toggle: setShowSupply },
              { key: 'zones',  label: 'Rent zone markers',    color: 'bg-gradient-to-r from-rose-500 via-sky-500 to-emerald-500', state: showZones,  toggle: setShowZones },
            ].map(l => (
              <button key={l.key} onClick={() => l.toggle(p => !p)}
                className={`flex items-center gap-2 w-full rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${l.state ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500'}`}>
                <span className={`w-3 h-3 rounded shrink-0 ${l.state ? l.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                {l.label}
                <span className="ml-auto text-[10px]">{l.state ? '●' : '○'}</span>
              </button>
            ))}
          </div>

          {/* Colour legend */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hex colour = opportunity</p>
            <div className="h-3 rounded-lg overflow-hidden flex">
              {['#ef4444','#fb923c','#fbbf24','#4ade80','#16a34a'].map(c => (
                <div key={c} className="flex-1" style={{ background: c }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
              <span>Saturated</span><span>Moderate</span><span>Opportunity</span>
            </div>
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow shrink-0" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Supply business (size = review volume)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-800 border-2 border-white shadow shrink-0" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">High-rated supply (strong incumbent)</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && ratingMeta && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 space-y-3 border-t border-slate-100 dark:border-slate-800">

              {/* Rating + trend */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-xs font-bold ${ratingMeta.color}`}>{ratingMeta.label}</p>
                  {trendMeta && (
                    <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${trendMeta.bg} ${trendMeta.color}`}>
                      {trendMeta.label}
                      {stats.trendChangePercent !== 0 && <span>({stats.trendChangePercent > 0 ? '+' : ''}{stats.trendChangePercent}% 5yr)</span>}
                    </span>
                  )}
                </div>
                <span className={`text-3xl font-black shrink-0 ${ratingMeta.color}`}>{stats.gapScore}</span>
              </div>

              {/* Scores */}
              <div className="space-y-1.5">
                <ScoreRow label="Demand"  value={stats.demandScore}  color="bg-orange-400" />
                <ScoreRow label="Supply"  value={stats.supplyScore}  color="bg-indigo-500" />
                <ScoreRow label="Gap"     value={stats.gapScore}     color={ratingMeta.bar} />
              </div>

              {/* Mini metrics grid */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                {[
                  { label: 'Total supply', value: stats.supplyCount },
                  { label: 'Avg rating', value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—' },
                  { label: 'Type-tagged', value: stats.googleCount - stats.textSearchCount - stats.umbrellaCount },
                  { label: 'Keyword search', value: stats.textSearchCount },
                  { label: 'Broad types', value: stats.umbrellaCount },
                  { label: 'Multilingual', value: stats.multilingualCount },
                  { label: 'OSM places', value: stats.osmCount },
                  { label: 'Total reviews', value: stats.totalReviews.toLocaleString() },
                  { label: 'City demand', value: `${stats.cityScore}` },
                  { label: 'Opp. zones', value: stats.opportunityHexes },
                  { label: 'Hot zones', value: stats.highOpportunityHexes },
                  { label: 'Formal biz idx', value: `${stats.formalBusinessIndex}/100` },
                  { label: 'Purch. power', value: `${stats.purchasingPower}/100` },
                ].map(m => (
                  <div key={m.label} className="rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-2 py-1.5 text-center">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{m.value}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>

              {catInfo && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-2">
                  Demand keyword: <span className="font-medium">{catInfo.trendsKeywords[0]}</span>
                </p>
              )}
            </div>
          )}

          {/* ── Zone ROI Panel ─────────────────────────────────────────────────── */}
          {zoneROIs && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rent Zone ROI</p>
                {!stats && <span className="text-[9px] text-slate-400 dark:text-slate-500">Run analysis to compute</span>}
              </div>

              {stats && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Click a zone to fly there · markers visible on map
                </p>
              )}

              <div className="space-y-1">
                {zoneROIs.map((zone) => (
                  <button
                    key={zone.zone}
                    onClick={() => {
                      mapRef.current?.flyTo({ center: [zone.anchorLng, zone.anchorLat], zoom: 14, duration: 1200, essential: true })
                      setHoveredZone(zone.zone)
                    }}
                    onMouseEnter={() => setHoveredZone(zone.zone)}
                    onMouseLeave={() => setHoveredZone(null)}
                    className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] border transition-colors ${
                      hoveredZone === zone.zone
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-indigo-200 dark:hover:border-indigo-700'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ZONE_COLORS[zone.idx].dot}`} />
                    <span className="flex-1 font-medium text-slate-700 dark:text-slate-300 leading-tight truncate">{zone.zone}</span>
                    {zone.roi && zone.band ? (
                      <div className="shrink-0 text-right space-y-0.5">
                        <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${zone.band.cls}`}>{zone.band.label}</span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{zone.roi.roiMin.toFixed(1)}–{zone.roi.roiMax.toFixed(1)}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 shrink-0">₹{zone.rentMin}–{zone.rentMax}/sqft</span>
                    )}
                  </button>
                ))}
              </div>

              {stats && (
                <p className="text-[9px] text-slate-400 dark:text-slate-600 leading-relaxed">
                  ROI = gap ÷ (monthly rent / ₹10K). Higher = more opportunity per rupee of rent.
                </p>
              )}

              {/* Rent reference table — shown before analysis */}
              {!stats && (
                <div className="rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="text-left px-2 py-1.5 font-bold text-slate-400 uppercase tracking-wider">Zone</th>
                        <th className="text-right px-2 py-1.5 font-bold text-slate-400 uppercase tracking-wider">₹/sqft</th>
                        <th className="text-right px-2 py-1.5 font-bold text-slate-400 uppercase tracking-wider">~{zoneROIs[0]?.typicalSqft}sqft</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zoneROIs.map(zone => (
                        <tr key={zone.zone} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="px-2 py-1.5 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${ZONE_COLORS[zone.idx].dot}`} />
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[80px]">{zone.zone.split(' ')[0]}</span>
                          </td>
                          <td className="px-2 py-1.5 text-right text-slate-500 dark:text-slate-400">
                            {zone.rentMin}–{zone.rentMax}
                          </td>
                          <td className="px-2 py-1.5 text-right text-slate-500 dark:text-slate-400">
                            {fmtINR(zone.rentMin * zone.typicalSqft)}–{fmtINR(zone.rentMax * zone.typicalSqft)}/mo
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </aside>

      {/* ── Sidebar toggle ───────────────────────────────────────────────────── */}
      <button
        onClick={() => setSidebarOpen(p => !p)}
        style={{ left: sidebarOpen ? '17rem' : 0 }}
        className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-5 h-10 rounded-r-lg bg-white dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-700 shadow-md text-slate-500 hover:text-indigo-600 transition-colors"
        aria-label="Toggle sidebar"
      >
        <span className="text-xs">{sidebarOpen ? '‹' : '›'}</span>
      </button>

      {/* ── Map ──────────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          mapStyle={darkMode ? STYLE_DARK : STYLE_LIGHT}
          initialViewState={{ longitude: 78.9629, latitude: 20.5937, zoom: 4.5 }}
          interactiveLayerIds={['hex-fill', 'supply-point', 'supply-clusters']}
          onClick={onClick}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
          cursor={cityId && !loading ? 'crosshair' : 'default'}
        >
          <NavigationControl position="bottom-right" />

          {/* Search centre pin */}
          {searchCenter && (
            <Marker latitude={searchCenter.lat} longitude={searchCenter.lng} anchor="center">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-8 h-8 rounded-full border-2 border-indigo-400 opacity-60 animate-ping" />
                <div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-lg z-10" />
              </div>
            </Marker>
          )}

          {/* H3 hex grid */}
          {hexGeo && showHex && (
            <Source id="hex" type="geojson" data={hexGeo}>
              <Layer {...hexFillLayer} />
              <Layer {...hexOutlineLayer} />
            </Source>
          )}

          {/* Supply businesses */}
          {supplyGeo && showSupply && (
            <Source id="supply" type="geojson" data={supplyGeo} cluster clusterMaxZoom={13} clusterRadius={40}>
              <Layer {...clusterCircleLayer} />
              <Layer {...clusterCountLayer} />
              <Layer {...pointLayer} />
            </Source>
          )}

          {/* ── Zone rent markers ─────────────────────────────────────────────── */}
          {showZones && zoneROIs && zoneROIs.map(zone => (
            <Marker
              key={zone.zone}
              latitude={zone.anchorLat}
              longitude={zone.anchorLng}
              anchor="bottom"
            >
              <button
                onClick={e => {
                  e.stopPropagation()
                  setHoveredZone(hoveredZone === zone.zone ? null : zone.zone)
                }}
                onMouseEnter={() => setHoveredZone(zone.zone)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold shadow-lg border-2 border-white transition-all select-none ${
                  hoveredZone === zone.zone
                    ? 'scale-110 shadow-xl ring-2 ring-white/60'
                    : 'hover:scale-105'
                } ${ZONE_COLORS[zone.idx].marker} text-white`}
                title={`${zone.zone} — ₹${zone.rentMin}–${zone.rentMax}/sqft`}
              >
                {zone.zone.split(' ')[0]}
                {zone.roi ? (
                  <span className="ml-0.5 opacity-90">{zone.roi.roiMin.toFixed(0)}–{zone.roi.roiMax.toFixed(0)}</span>
                ) : (
                  <span className="ml-0.5 opacity-75">₹{zone.rentMin}+</span>
                )}
              </button>
            </Marker>
          ))}

          {/* ── Popup ────────────────────────────────────────────────────────── */}
          {popup && (
            <Popup longitude={popup.lng} latitude={popup.lat} closeButton onClose={() => setPopup(null)} anchor="bottom" offset={12}>
              <div className="min-w-[190px] max-w-[240px] rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-700 p-3 text-xs space-y-2">

                {popup.kind === 'hex' && (() => {
                  const p = popup.props
                  const score = p.opportunityScore
                  const label = score >= 70 ? '🟢 High Opportunity' : score >= 45 ? '🟡 Moderate' : score >= 20 ? '🟠 Low Gap' : '🔴 Saturated'
                  // Find nearest zone by matching to rent profile if available
                  const nearestZone = zoneROIs
                    ? zoneROIs.reduce((best, z) => {
                        const d = Math.hypot(z.anchorLat - popup.lat, z.anchorLng - popup.lng)
                        return d < best.d ? { z, d } : best
                      }, { z: zoneROIs[0], d: Infinity }).z
                    : null
                  return (
                    <>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{label}</p>
                      <div className="space-y-1">
                        <ScoreRow label="Demand"  value={p.demandScore}       color="bg-orange-400" />
                        <ScoreRow label="Supply"  value={p.supplyScore}       color="bg-indigo-500" />
                        <ScoreRow label="Gap"     value={p.gapScore}          color="bg-green-500"  />
                        <ScoreRow label="Opp."    value={p.opportunityScore}  color="bg-teal-500"   />
                      </div>
                      {nearestZone?.roi && (
                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Nearest zone: {nearestZone.zone.split(' ')[0]}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">
                              ₹{nearestZone.rentMin}–{nearestZone.rentMax}/sqft
                            </span>
                            {nearestZone.band && (
                              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${nearestZone.band.cls}`}>
                                {nearestZone.band.label}
                              </span>
                            )}
                          </div>
                          {nearestZone.roi && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              ROI: {nearestZone.roi.roiMin.toFixed(1)}–{nearestZone.roi.roiMax.toFixed(1)} · {fmtINR(nearestZone.roi.monthlyRentMin)}–{fmtINR(nearestZone.roi.monthlyRentMax)}/mo
                            </p>
                          )}
                        </div>
                      )}
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5 text-slate-500 dark:text-slate-400">
                        <p>{p.supplyCount} business{p.supplyCount !== 1 ? 'es' : ''} in this hex{p.osmCount > 0 ? ` (${p.osmCount} OSM)` : ''}</p>
                        {p.avgRating > 0 && <p>Avg rating: {p.avgRating} ★ · {p.totalReviews} reviews</p>}
                        {p.avgFootfall > 0 && <p>Avg footfall signal: {p.avgFootfall}%</p>}
                        <p className="text-[10px]">{p.distKm} km from city centre · ~0.46 km² hex</p>
                      </div>
                    </>
                  )
                })()}

                {popup.kind === 'point' && (() => {
                  const p = popup.props
                  return (
                    <>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</p>
                      {p.vicinity && <p className="text-slate-500 dark:text-slate-400">{p.vicinity}</p>}
                      <Stars rating={p.rating} />
                      {p.userRatingsTotal > 0 && (
                        <p className="text-slate-400 dark:text-slate-500">{p.userRatingsTotal.toLocaleString()} reviews</p>
                      )}
                      {p.userRatingsTotal >= 500 && (
                        <p className="text-rose-600 dark:text-rose-400 font-medium">⚠ Strong incumbent — high entry barrier</p>
                      )}
                      {p.userRatingsTotal < 50 && p.userRatingsTotal > 0 && (
                        <p className="text-green-600 dark:text-green-400 font-medium">✓ Low-engagement — weak competition</p>
                      )}
                    </>
                  )
                })()}

                {popup.kind === 'cluster' && (
                  <>
                    <p className="font-semibold text-indigo-700 dark:text-indigo-300">{popup.count} businesses here</p>
                    <p className="text-slate-500 dark:text-slate-400">Zoom in to see individual businesses and their review count.</p>
                  </>
                )}
              </div>
            </Popup>
          )}
        </Map>

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {!hexGeo && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 px-8 py-6 text-center shadow-lg max-w-xs">
              <p className="text-3xl mb-3">🗺️</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select a city and category</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                The hex grid colours each ~460 m zone green (opportunity) to red (saturated) based on demand vs. real business supply.
                Zone markers show rent cost — click to fly there.
              </p>
            </div>
          </div>
        )}

        {/* ── Loading overlay ───────────────────────────────────────────────── */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 px-8 py-6 shadow-xl">
              <div className="w-8 h-8 rounded-full border-[3px] border-indigo-600 border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Analysing…</p>
              <div className="space-y-1 text-center">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">📈 Google Trends — city + 5yr direction</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">🔍 Keyword text search (Indian names)</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">🗺️ Typed + umbrella Places API</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">🌐 Multilingual name classification</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">🌍 OpenStreetMap Overpass supplement</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">🔷 H3 hex grid · Census 2011 density</p>
              </div>
            </div>
          </div>
        )}

        {/* Attribution */}
        <div className="absolute bottom-1 right-2 text-[9px] text-slate-400/50 dark:text-slate-600/50 pointer-events-none select-none">
          Map © CARTO · OSM · Data: Google Trends, Maps Places, OSM Overpass, Census 2011, Udyam MSME, MCA21, GSTN · Rent: Anarock/JLL/Knight Frank 2024
        </div>
      </div>
    </div>
  )
}
