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

// ─── H3 hex fill — deliberate data-viz scale (DESIGN.md map note):
//     alert (saturated) → caution (moderate) → positive (opportunity) ─────────
const hexFillLayer: LayerProps = {
  id: 'hex-fill',
  type: 'fill',
  paint: {
    'fill-color': e(['interpolate', ['linear'], ['get', 'opportunityScore'],
      0,  '#c0362c',   // alert   = saturated
      20, '#d05a2a',   // alert→caution blend
      40, '#b26a00',   // caution = moderate
      60, '#5aa36e',   // caution→positive blend
      80, '#1f8a55',   // positive = high opportunity
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

// ─── Zone marker styling (Prime → Secondary → Suburban → Peripheral) ──────────
// Non-semantic location tiers → single indigo intensity ramp (One Voice Rule).
const ZONE_COLORS = [
  { dot: 'bg-brand-700', marker: 'bg-brand-700', border: 'border-brand-700' },
  { dot: 'bg-brand-600', marker: 'bg-brand-600', border: 'border-brand-600' },
  { dot: 'bg-brand-500', marker: 'bg-brand-500', border: 'border-brand-500' },
  { dot: 'bg-brand-500/60', marker: 'bg-brand-500/70', border: 'border-brand-500/60' },
]

// ROI band = profitability of rent → semantic positive/caution scale.
const ROI_BAND = (roi: number) => {
  if (roi >= 20) return { label: 'Exceptional', cls: 'bg-positive/10 text-positive dark:bg-positive/15' }
  if (roi >= 10) return { label: 'Strong',      cls: 'bg-positive/10 text-positive dark:bg-positive/15' }
  if (roi >= 5)  return { label: 'Moderate',    cls: 'bg-caution/10 text-caution dark:bg-caution/15' }
  return           { label: 'Low',          cls: 'bg-surface-sunk text-ink-soft dark:bg-surface-dark-raised dark:text-paper-dark/60' }
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
  high:      { label: 'High Opportunity',    color: 'text-positive',                       bar: 'bg-positive',  dot: 'bg-positive'  },
  medium:    { label: 'Moderate Opportunity', color: 'text-caution',                        bar: 'bg-caution',   dot: 'bg-caution'   },
  low:       { label: 'Low Gap',             color: 'text-ink-soft dark:text-paper-dark/60', bar: 'bg-ink-soft/50', dot: 'bg-ink-soft/50' },
  saturated: { label: 'Saturated Market',    color: 'text-alert',                          bar: 'bg-alert',     dot: 'bg-alert'     },
}

const TIER_ORDER: PopulationTier[] = ['metro', 'tier1', 'tier2', 'tier3']
const RADIUS_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '3 km', value: 3000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
]

const TREND_META = {
  growing:   { label: '↑ Growing',   color: 'text-positive',                        bg: 'bg-positive/10 border-positive/30' },
  stable:    { label: '→ Stable',    color: 'text-ink-soft dark:text-paper-dark/60', bg: 'bg-surface-sunk border-line dark:bg-surface-dark-raised dark:border-line-dark' },
  declining: { label: '↓ Declining', color: 'text-alert',                           bg: 'bg-alert/10 border-alert/30' },
}

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
function ScoreRow({ label, value, color, max = 100 }: { label: string; value: number; color: string; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[11px] text-ink-soft dark:text-paper-dark/60">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-surface-sunk dark:bg-surface-dark-raised overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="w-7 text-right text-[11px] font-semibold tabular-nums text-ink dark:text-paper-dark">{value}</span>
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  if (!rating) return null
  return (
    <span className="text-caution font-semibold text-xs tabular-nums">
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
    <div className="relative flex h-[84vh] min-h-[540px] w-full overflow-hidden rounded-lg border border-line dark:border-line-dark shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)]">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className={`relative z-10 flex flex-col bg-surface/96 dark:bg-surface-dark/96 backdrop-blur-sm border-r border-line dark:border-line-dark overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'w-72 min-w-[17rem]' : 'w-0 overflow-hidden'}`}>
        <div className="p-4 space-y-4 min-w-[17rem]">

          {/* Title */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-500">Hyperlocal Opportunity + ROI</p>
            <p className="mt-0.5 text-sm font-bold text-ink dark:text-paper-dark">Configure analysis</p>
          </div>

          {/* Tier filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60">City tier</label>
            <div className="flex flex-wrap gap-1">
              {(['all', ...TIER_ORDER] as const).map(t => {
                const active = tierFilter === t
                return (
                  <button key={t} onClick={() => { setTierFilter(t); setCityId('') }}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${active ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-600/20 dark:text-brand-100 dark:border-brand-600/40' : 'border-line dark:border-line-dark text-ink-soft dark:text-paper-dark/60 hover:border-brand-600/40'}`}>
                    {active && <span aria-hidden>✓</span>}
                    {t === 'all' ? 'All' : TIER_LABELS[t].split(' ')[0]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* City */}
          <div className="space-y-1">
            <label htmlFor="hl-city" className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60">City</label>
            <select id="hl-city" value={cityId} onChange={e => { setCityId(e.target.value); setSearchCenter(null); setScanResults([]) }}
              className="w-full rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised px-2.5 py-2 text-sm text-ink dark:text-paper-dark focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/40">
              <option value="">Select city…</option>
              {filteredCities.map(c => <option key={c.id} value={c.id}>{c.name} — {c.state}</option>)}
            </select>
          </div>

          {/* Custom search */}
          <div className="space-y-1.5">
            <label htmlFor="hl-custom" className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60">Custom search</label>
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
                id="hl-custom"
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="e.g. korean spa, art store…"
                className="flex-1 rounded-md border border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised px-2.5 py-1.5 text-xs text-ink dark:text-paper-dark placeholder-ink-soft/50 dark:placeholder-paper-dark/40 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/40"
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="shrink-0 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
              >
                Go
              </button>
            </form>
            {isCustomMode && (
              <div className="flex items-center justify-between rounded-md border border-brand-200 dark:border-brand-600/40 bg-brand-50 dark:bg-brand-600/15 px-2.5 py-1.5">
                <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-100 truncate"><span aria-hidden>🔍</span> {customQuery}</span>
                <button
                  onClick={() => { setCustomQuery(''); setCustomInput('') }}
                  className="shrink-0 ml-2 text-[10px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-200 dark:hover:text-brand-100 underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60">
              {isCustomMode ? 'Or pick a preset' : 'Category'}
            </label>
            <div className="space-y-0.5">
              {CATEGORIES.map(cat => {
                const selected = !isCustomMode && catId === cat.id
                return (
                  <button key={cat.id} onClick={() => { setCatId(cat.id); setCustomQuery(''); setCustomInput('') }}
                    className={`w-full flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors border ${
                      selected
                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-600/15 text-brand-700 dark:text-brand-100'
                        : 'border-transparent text-ink-soft dark:text-paper-dark/60 hover:bg-surface-sunk dark:hover:bg-surface-dark-raised hover:text-ink dark:hover:text-paper-dark'
                    }`}>
                    <span className={`w-3.5 h-3.5 rounded shrink-0 border flex items-center justify-center transition-colors ${
                      selected
                        ? 'bg-brand-600 border-brand-600'
                        : 'border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised'
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
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60">Supply search radius</label>
            <div className="flex gap-1.5">
              {RADIUS_OPTIONS.map(r => {
                const active = radius === r.value
                return (
                  <button key={r.value} onClick={() => setRadius(r.value)}
                    aria-pressed={active}
                    className={`flex-1 rounded-md border py-1.5 text-xs font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${active ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-600/20 dark:text-brand-100 dark:border-brand-600/40' : 'border-line dark:border-line-dark text-ink-soft dark:text-paper-dark/60 hover:border-brand-600/40'}`}>
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom centre indicator + reset */}
          {searchCenter ? (
            <div className="flex items-center justify-between gap-2 rounded-md border border-brand-200 dark:border-brand-600/40 bg-brand-50 dark:bg-brand-600/15 px-2.5 py-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span aria-hidden className="text-brand-600 text-sm shrink-0">📍</span>
                <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-100 truncate">Custom pin set</span>
              </div>
              <button onClick={() => setSearchCenter(null)}
                className="shrink-0 text-[10px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-200 dark:hover:text-brand-100 underline">
                Reset
              </button>
            </div>
          ) : cityId ? (
            <p className="text-[10px] text-ink-soft/70 dark:text-paper-dark/50 text-center">
              Click anywhere on the map to move the search pin
            </p>
          ) : null}

          {/* Analyse */}
          <button onClick={analyse} disabled={!cityId || (!catId && !customQuery) || loading}
            className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-bold text-white shadow hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:focus-visible:ring-offset-surface-dark">
            {loading ? 'Analysing…' : 'Analyse →'}
          </button>

          {error && <p className="rounded-md border border-alert/30 bg-alert/10 p-2 text-xs text-alert">{error}</p>}

          {/* Scan all categories */}
          {cityId && (
            <button onClick={scanAll} disabled={scanning || loading}
              className="w-full rounded-md border-2 border-dashed border-brand-300 dark:border-brand-600/50 py-2 text-xs font-bold text-brand-600 dark:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-600/15 disabled:opacity-40 transition-colors">
              {scanning ? '⏳ Scanning all categories…' : '⚡ Scan All Categories'}
            </button>
          )}

          {/* Ranked scan results */}
          {scanResults.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-line dark:border-line-dark">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60 pb-1">
                All {scanResults.length} categories ranked
              </p>
              {scanResults.map((r, i) => {
                const meta = RATING_META[r.rating]
                return (
                  <button key={r.id} onClick={() => setCatId(r.id)}
                    className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors border ${
                      catId === r.id
                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-600/15'
                        : 'border-line dark:border-line-dark hover:border-brand-200 dark:hover:border-brand-600/40 bg-surface dark:bg-surface-dark/40'
                    }`}>
                    <span className="text-[10px] font-bold tabular-nums text-ink-soft/50 dark:text-paper-dark/40 w-4 shrink-0 text-right">{i + 1}</span>
                    <span aria-hidden className="text-sm shrink-0">{r.icon}</span>
                    <span className="flex-1 text-[11px] font-medium text-ink-soft dark:text-paper-dark/70 leading-tight truncate">{r.label}</span>
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span className="text-[10px] tabular-nums text-ink-soft/70 dark:text-paper-dark/50">{r.supplyCount}↓</span>
                      <span className={`text-xs font-black tabular-nums ${meta.color}`}>{r.gapScore}</span>
                      <span aria-hidden className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                    </div>
                  </button>
                )
              })}
              <p className="text-[9px] text-ink-soft/60 dark:text-paper-dark/40 pt-1">
                Gap score = demand − supply · click to deep-analyse
              </p>
            </div>
          )}

          {/* Layer toggles */}
          <div className="pt-2 border-t border-line dark:border-line-dark space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60">Layers</p>
            {[
              { key: 'hex',    label: 'Opportunity hex grid', color: 'bg-gradient-to-r from-alert via-caution to-positive', state: showHex,    toggle: setShowHex },
              { key: 'supply', label: 'Supply businesses',    color: 'bg-brand-600',                                        state: showSupply, toggle: setShowSupply },
              { key: 'zones',  label: 'Rent zone markers',    color: 'bg-gradient-to-r from-brand-700 to-brand-500',        state: showZones,  toggle: setShowZones },
            ].map(l => (
              <button key={l.key} onClick={() => l.toggle(p => !p)}
                aria-pressed={l.state}
                className={`flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors ${l.state ? 'border-line dark:border-line-dark bg-surface dark:bg-surface-dark-raised text-ink dark:text-paper-dark' : 'border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark text-ink-soft/60 dark:text-paper-dark/40'}`}>
                <span aria-hidden className={`w-3 h-3 rounded shrink-0 ${l.state ? l.color : 'bg-line dark:bg-line-dark'}`} />
                {l.label}
                <span aria-hidden className="ml-auto text-[10px]">{l.state ? '●' : '○'}</span>
              </button>
            ))}
          </div>

          {/* Colour legend */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60">Hex colour = opportunity</p>
            <div className="h-3 rounded-md overflow-hidden flex">
              {['#c0362c','#d05a2a','#b26a00','#5aa36e','#1f8a55'].map(c => (
                <div key={c} className="flex-1" style={{ background: c }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-ink-soft/70 dark:text-paper-dark/50">
              <span>Saturated</span><span>Moderate</span><span>Opportunity</span>
            </div>
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <span aria-hidden className="w-3 h-3 rounded-full bg-brand-600 border-2 border-white shadow shrink-0" />
                <span className="text-[11px] text-ink-soft dark:text-paper-dark/60">Supply business (size = review volume)</span>
              </div>
              <div className="flex items-center gap-2">
                <span aria-hidden className="w-3 h-3 rounded-full bg-brand-700 border-2 border-white shadow shrink-0" />
                <span className="text-[11px] text-ink-soft dark:text-paper-dark/60">High-rated supply (strong incumbent)</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && ratingMeta && (
            <div className="rounded-lg border border-line dark:border-line-dark bg-surface-sunk dark:bg-surface-dark/50 p-3 space-y-3">

              {/* Rating + trend */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-xs font-bold ${ratingMeta.color}`}>{ratingMeta.label}</p>
                  {trendMeta && (
                    <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tabular-nums ${trendMeta.bg} ${trendMeta.color}`}>
                      {trendMeta.label}
                      {stats.trendChangePercent !== 0 && <span>({stats.trendChangePercent > 0 ? '+' : ''}{stats.trendChangePercent}% 5yr)</span>}
                    </span>
                  )}
                </div>
                <span className={`text-3xl font-black shrink-0 tabular-nums ${ratingMeta.color}`}>{stats.gapScore}</span>
              </div>

              {/* Scores */}
              <div className="space-y-1.5">
                <ScoreRow label="Demand"  value={stats.demandScore}  color="bg-caution" />
                <ScoreRow label="Supply"  value={stats.supplyScore}  color="bg-brand-600" />
                <ScoreRow label="Gap"     value={stats.gapScore}     color={ratingMeta.bar} />
              </div>

              {/* Mini metrics grid */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-line dark:border-line-dark">
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
                  <div key={m.label} className="rounded-md bg-surface dark:bg-surface-dark border border-line dark:border-line-dark px-2 py-1.5 text-center">
                    <p className="text-xs font-bold tabular-nums text-ink dark:text-paper-dark">{m.value}</p>
                    <p className="text-[10px] text-ink-soft/70 dark:text-paper-dark/50 leading-tight mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>

              {catInfo && (
                <p className="text-[10px] text-ink-soft/70 dark:text-paper-dark/50 border-t border-line dark:border-line-dark pt-2">
                  Demand keyword: <span className="font-medium">{catInfo.trendsKeywords[0]}</span>
                </p>
              )}
            </div>
          )}

          {/* ── Zone ROI Panel ─────────────────────────────────────────────────── */}
          {zoneROIs && (
            <div className="pt-2 border-t border-line dark:border-line-dark space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-paper-dark/60">Rent Zone ROI</p>
                {!stats && <span className="text-[9px] text-ink-soft/70 dark:text-paper-dark/50">Run analysis to compute</span>}
              </div>

              {stats && (
                <p className="text-[10px] text-ink-soft/70 dark:text-paper-dark/50">
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
                    className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] border transition-colors ${
                      hoveredZone === zone.zone
                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-600/15'
                        : 'border-line dark:border-line-dark bg-surface dark:bg-surface-dark/40 hover:border-brand-200 dark:hover:border-brand-600/40'
                    }`}
                  >
                    <span aria-hidden className={`w-2.5 h-2.5 rounded-full shrink-0 ${ZONE_COLORS[zone.idx].dot}`} />
                    <span className="flex-1 font-medium text-ink-soft dark:text-paper-dark/70 leading-tight truncate">{zone.zone}</span>
                    {zone.roi && zone.band ? (
                      <div className="shrink-0 text-right space-y-0.5">
                        <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${zone.band.cls}`}>{zone.band.label}</span>
                        <p className="text-[10px] tabular-nums text-ink-soft dark:text-paper-dark/60">{zone.roi.roiMin.toFixed(1)}–{zone.roi.roiMax.toFixed(1)}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] tabular-nums text-ink-soft/70 dark:text-paper-dark/50 shrink-0">₹{zone.rentMin}–{zone.rentMax}/sqft</span>
                    )}
                  </button>
                ))}
              </div>

              {stats && (
                <p className="text-[9px] text-ink-soft/60 dark:text-paper-dark/40 leading-relaxed">
                  ROI = gap ÷ (monthly rent / ₹10K). Higher = more opportunity per rupee of rent.
                </p>
              )}

              {/* Rent reference table — shown before analysis */}
              {!stats && (
                <div className="rounded-md border border-line dark:border-line-dark overflow-hidden">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-surface-sunk dark:bg-surface-dark-raised">
                        <th className="text-left px-2 py-1.5 font-bold text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-wider">Zone</th>
                        <th className="text-right px-2 py-1.5 font-bold text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-wider">₹/sqft</th>
                        <th className="text-right px-2 py-1.5 font-bold text-ink-soft/70 dark:text-paper-dark/50 uppercase tracking-wider">~{zoneROIs[0]?.typicalSqft}sqft</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zoneROIs.map(zone => (
                        <tr key={zone.zone} className="border-t border-line dark:border-line-dark">
                          <td className="px-2 py-1.5 flex items-center gap-1.5">
                            <span aria-hidden className={`w-2 h-2 rounded-full shrink-0 ${ZONE_COLORS[zone.idx].dot}`} />
                            <span className="font-medium text-ink-soft dark:text-paper-dark/70 truncate max-w-[80px]">{zone.zone.split(' ')[0]}</span>
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-ink-soft dark:text-paper-dark/60">
                            {zone.rentMin}–{zone.rentMax}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-ink-soft dark:text-paper-dark/60">
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
        className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-5 h-10 rounded-r-lg bg-surface dark:bg-surface-dark-raised border border-l-0 border-line dark:border-line-dark shadow-md text-ink-soft hover:text-brand-600 transition-colors"
        aria-label="Toggle sidebar"
      >
        <span aria-hidden className="text-xs">{sidebarOpen ? '‹' : '›'}</span>
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
                <div className="absolute w-8 h-8 rounded-full border-2 border-brand-500 opacity-60 animate-ping" />
                <div className="w-4 h-4 rounded-full bg-brand-600 border-2 border-white shadow-lg z-10" />
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
              <div className="min-w-[190px] max-w-[240px] rounded-lg bg-surface dark:bg-surface-dark shadow-xl border border-line dark:border-line-dark p-3 text-xs space-y-2">

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
                      <p className="font-bold text-ink dark:text-paper-dark">{label}</p>
                      <div className="space-y-1">
                        <ScoreRow label="Demand"  value={p.demandScore}       color="bg-caution" />
                        <ScoreRow label="Supply"  value={p.supplyScore}       color="bg-brand-600" />
                        <ScoreRow label="Gap"     value={p.gapScore}          color="bg-positive"  />
                        <ScoreRow label="Opp."    value={p.opportunityScore}  color="bg-positive/70"   />
                      </div>
                      {nearestZone?.roi && (
                        <div className="pt-1 border-t border-line dark:border-line-dark">
                          <p className="text-[10px] font-bold text-ink-soft dark:text-paper-dark/60 uppercase tracking-wider mb-1">
                            Nearest zone: {nearestZone.zone.split(' ')[0]}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="tabular-nums text-ink-soft dark:text-paper-dark/60">
                              ₹{nearestZone.rentMin}–{nearestZone.rentMax}/sqft
                            </span>
                            {nearestZone.band && (
                              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${nearestZone.band.cls}`}>
                                {nearestZone.band.label}
                              </span>
                            )}
                          </div>
                          {nearestZone.roi && (
                            <p className="text-[10px] tabular-nums text-ink-soft/70 dark:text-paper-dark/50 mt-0.5">
                              ROI: {nearestZone.roi.roiMin.toFixed(1)}–{nearestZone.roi.roiMax.toFixed(1)} · {fmtINR(nearestZone.roi.monthlyRentMin)}–{fmtINR(nearestZone.roi.monthlyRentMax)}/mo
                            </p>
                          )}
                        </div>
                      )}
                      <div className="pt-1 border-t border-line dark:border-line-dark space-y-0.5 text-ink-soft dark:text-paper-dark/60">
                        <p className="tabular-nums">{p.supplyCount} business{p.supplyCount !== 1 ? 'es' : ''} in this hex{p.osmCount > 0 ? ` (${p.osmCount} OSM)` : ''}</p>
                        {p.avgRating > 0 && <p className="tabular-nums">Avg rating: {p.avgRating} ★ · {p.totalReviews} reviews</p>}
                        {p.avgFootfall > 0 && <p className="tabular-nums">Avg footfall signal: {p.avgFootfall}%</p>}
                        <p className="text-[10px] tabular-nums">{p.distKm} km from city centre · ~0.46 km² hex</p>
                      </div>
                    </>
                  )
                })()}

                {popup.kind === 'point' && (() => {
                  const p = popup.props
                  return (
                    <>
                      <p className="font-semibold text-ink dark:text-paper-dark">{p.name}</p>
                      {p.vicinity && <p className="text-ink-soft dark:text-paper-dark/60">{p.vicinity}</p>}
                      <Stars rating={p.rating} />
                      {p.userRatingsTotal > 0 && (
                        <p className="tabular-nums text-ink-soft/70 dark:text-paper-dark/50">{p.userRatingsTotal.toLocaleString()} reviews</p>
                      )}
                      {p.userRatingsTotal >= 500 && (
                        <p className="text-alert font-medium">⚠ Strong incumbent — high entry barrier</p>
                      )}
                      {p.userRatingsTotal < 50 && p.userRatingsTotal > 0 && (
                        <p className="text-positive font-medium">✓ Low-engagement — weak competition</p>
                      )}
                    </>
                  )
                })()}

                {popup.kind === 'cluster' && (
                  <>
                    <p className="font-semibold tabular-nums text-brand-700 dark:text-brand-200">{popup.count} businesses here</p>
                    <p className="text-ink-soft dark:text-paper-dark/60">Zoom in to see individual businesses and their review count.</p>
                  </>
                )}
              </div>
            </Popup>
          )}
        </Map>

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {!hexGeo && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-sm rounded-lg border border-line dark:border-line-dark px-8 py-6 text-center shadow-lg max-w-xs">
              <p aria-hidden className="text-3xl mb-3">🗺️</p>
              <p className="text-sm font-semibold text-ink dark:text-paper-dark">Select a city and category</p>
              <p className="mt-1 text-xs text-ink-soft/80 dark:text-paper-dark/50">
                The hex grid colours each ~460 m zone green (opportunity) to red (saturated) based on demand vs. real business supply.
                Zone markers show rent cost — click to fly there.
              </p>
            </div>
          </div>
        )}

        {/* ── Loading overlay ───────────────────────────────────────────────── */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/60 dark:bg-ink-dark/60 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3 bg-surface dark:bg-surface-dark rounded-lg border border-line dark:border-line-dark px-8 py-6 shadow-xl">
              <div className="w-8 h-8 rounded-full border-[3px] border-brand-600 border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-ink dark:text-paper-dark">Analysing…</p>
              <div className="space-y-1 text-center">
                <p className="text-[11px] text-ink-soft/80 dark:text-paper-dark/50">📈 Google Trends — city + 5yr direction</p>
                <p className="text-[11px] text-ink-soft/80 dark:text-paper-dark/50">🔍 Keyword text search (Indian names)</p>
                <p className="text-[11px] text-ink-soft/80 dark:text-paper-dark/50">🗺️ Typed + umbrella Places API</p>
                <p className="text-[11px] text-ink-soft/80 dark:text-paper-dark/50">🌐 Multilingual name classification</p>
                <p className="text-[11px] text-ink-soft/80 dark:text-paper-dark/50">🌍 OpenStreetMap Overpass supplement</p>
                <p className="text-[11px] text-ink-soft/80 dark:text-paper-dark/50">🔷 H3 hex grid · Census 2011 density</p>
              </div>
            </div>
          </div>
        )}

        {/* Attribution */}
        <div className="absolute bottom-1 right-2 text-[9px] text-ink-soft/40 dark:text-paper-dark/30 pointer-events-none select-none">
          Map © CARTO · OSM · Data: Google Trends, Maps Places, OSM Overpass, Census 2011, Udyam MSME, MCA21, GSTN · Rent: Anarock/JLL/Knight Frank 2024
        </div>
      </div>
    </div>
  )
}
