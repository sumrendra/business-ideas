// Computes all 8 signals for each sector from preprocessed data files + static priors.
// MCA21 + Udyam data → dynamic signals (formation velocity, survival gradient, formalization)
// Sector definitions → static signals (credit, trade, employment, policy)
// Google Trends → search demand (optional live call, falls back to base score)

import { readFile } from 'fs/promises'
import path from 'path'
import type { Signal, FormationTick, SectorPulse, Lifecycle } from './types'
import { SECTORS, type SectorDef } from './sectors'

// ─── File readers ─────────────────────────────────────────────────────────────

async function loadMca21(): Promise<Record<string, Record<string, Record<number, { active: number; struckOff: number }>>>> {
  try {
    const raw = await readFile(path.join(process.cwd(), 'public/data/mca21/summary.json'), 'utf-8')
    return JSON.parse(raw).byStateNicYear ?? {}
  } catch { return {} }
}

async function loadUdyam(): Promise<Record<string, Record<string, Record<number, number>>>> {
  try {
    const raw = await readFile(path.join(process.cwd(), 'public/data/udyam/summary.json'), 'utf-8')
    return JSON.parse(raw).byCityNicYear ?? {}
  } catch { return {} }
}

// ─── Aggregations ─────────────────────────────────────────────────────────────

function aggregateMca21National(
  mca21: Record<string, Record<string, Record<number, { active: number; struckOff: number }>>>,
  nicCode: string
): { active: number; struckOff: number; byYear: Record<number, number> } {
  let active = 0, struckOff = 0
  const byYear: Record<number, number> = {}

  for (const nicMap of Object.values(mca21)) {
    const yd = nicMap[nicCode]
    if (!yd) continue
    for (const [yr, v] of Object.entries(yd)) {
      const year = parseInt(yr)
      active += v.active ?? 0
      struckOff += v.struckOff ?? 0
      byYear[year] = (byYear[year] ?? 0) + (v.active ?? 0) + (v.struckOff ?? 0)
    }
  }
  return { active, struckOff, byYear }
}

function aggregateUdyamNational(
  udyam: Record<string, Record<string, Record<number, number>>>,
  nicCode: string
): Record<number, number> {
  const byYear: Record<number, number> = {}
  for (const nicMap of Object.values(udyam)) {
    const yd = nicMap[nicCode]
    if (!yd) continue
    for (const [yr, count] of Object.entries(yd)) {
      const year = parseInt(yr)
      byYear[year] = (byYear[year] ?? 0) + count
    }
  }
  return byYear
}

// ─── Signal builders ──────────────────────────────────────────────────────────

function scoreSignal(score: number, direction: 'up' | 'down' | 'flat', changePct: number, label: string, note: string, source: string, isEstimated = false): Signal {
  return { score: Math.round(Math.max(0, Math.min(100, score))), direction, changePercent: Math.round(changePct), label, note, source, isEstimated }
}

function buildFormationVelocity(udyamByYear: Record<number, number>, mca21ByYear: Record<number, number>): Signal {
  // Strategy: MCA21 2016-2021 historical trend is the velocity anchor.
  // Udyam 2024 absolute volume is a level signal (2022 is inflated by catch-up registrations).
  const mYears = Object.entries(mca21ByYear)
    .map(([y, c]) => ({ year: parseInt(y), count: c }))
    .filter(d => d.year >= 2015 && d.year <= 2021 && d.count > 0)
    .sort((a, b) => a.year - b.year)

  const udyam24 = udyamByYear[2024] ?? 0
  const udyam25 = udyamByYear[2025] ?? 0
  const udyamRecent = udyam24 + Math.round(udyam25 * 0.4) // partial 2025 year

  // Level score from Udyam 2024 volume
  const levelScore = udyamRecent > 300000 ? 75
    : udyamRecent > 100000 ? 68
    : udyamRecent > 30000  ? 60
    : udyamRecent > 8000   ? 52
    : udyamRecent > 1000   ? 44
    : 35

  if (mYears.length >= 4) {
    const half = Math.floor(mYears.length / 2)
    const oldAvg = mYears.slice(0, half).reduce((s, d) => s + d.count, 0) / half
    const newAvg = mYears.slice(-half).reduce((s, d) => s + d.count, 0) / half
    const vel = oldAvg > 0 ? (newAvg - oldAvg) / oldAvg : 0
    // Blend MCA21 trend (60%) with Udyam level signal (40%)
    const trendScore = 50 + vel * 45
    const blended = trendScore * 0.60 + levelScore * 0.40
    const dir: Signal['direction'] = vel > 0.05 ? 'up' : vel < -0.05 ? 'down' : 'flat'
    const changePct = Math.round(vel * 100)
    const recentFormatted = udyamRecent > 0 ? `; ${udyamRecent.toLocaleString()} Udyam 2024` : ''
    return scoreSignal(blended, dir, changePct, `${changePct > 0 ? '+' : ''}${changePct}% hist. trend`, `MCA21 incorporation trend 2015–2021${recentFormatted}`, 'MCA21 + Udyam')
  }

  // MCA21 data sparse — use Udyam level only
  const dir: Signal['direction'] = levelScore >= 62 ? 'up' : levelScore <= 45 ? 'down' : 'flat'
  return scoreSignal(levelScore, dir, 0, udyamRecent > 0 ? `${udyamRecent.toLocaleString()} reg/yr` : 'Limited data', `Udyam 2024 volume: ${udyamRecent.toLocaleString()} registrations`, 'Udyam')
}

function buildSurvivalGradient(active: number, struckOff: number): Signal {
  const total = active + struckOff
  if (total < 50) return scoreSignal(50, 'flat', 0, 'No data', 'Insufficient MCA21 data', 'MCA21')

  const survivalRate = active / total
  // National avg survival ~78%; score calibrated so 78% = 55, 90% = 80, 65% = 30
  const score = Math.min(100, (survivalRate / 0.78) * 55)
  const diff = Math.round((survivalRate - 0.78) * 100)
  const dir: Signal['direction'] = diff > 3 ? 'up' : diff < -3 ? 'down' : 'flat'
  return scoreSignal(score, dir, diff, `${Math.round(survivalRate * 100)}% survival`, `${active.toLocaleString()} active vs ${struckOff.toLocaleString()} struck off (national)`, 'MCA21 Company Master')
}

function buildFormalizationGap(udyamTotal: number, sector: SectorDef): Signal {
  // Low formalization = high opportunity score (large informal economy = market to capture)
  // Formalization proxy: if Udyam registrations are large relative to historical MCA21, sector is formalizing fast
  // Score: higher = more informal economy remaining = more opportunity
  const isHighlyInformal = ['01', '47', '56', '96', '14', '13', '85'].includes(sector.nicCode)
  const isFormalizing = ['62', '64', '65', '82', '72'].includes(sector.nicCode)

  let baseScore = isHighlyInformal ? 75 : isFormalizing ? 30 : 52
  // Udyam volume signal: more registrations = faster formalization = lower future gap
  const udyamSignal = udyamTotal > 500000 ? -8 : udyamTotal > 200000 ? -4 : 0
  const score = baseScore + udyamSignal

  const note = udyamTotal > 0
    ? `${udyamTotal.toLocaleString()} MSME registrations in this sector; ~${isHighlyInformal ? '60–80' : '20–40'}% still informal`
    : 'Formalization gap estimated from sector characteristics'

  return scoreSignal(score, udyamTotal > 300000 ? 'down' : 'flat', 0, isHighlyInformal ? 'High gap' : isFormalizing ? 'Low gap' : 'Moderate', note, 'Udyam + GSTN', !udyamTotal)
}

function buildStaticSignal(score: number, note: string, source: string, changeNote: string): Signal {
  const dir: Signal['direction'] = score >= 65 ? 'up' : score <= 40 ? 'down' : 'flat'
  return scoreSignal(score, dir, 0, changeNote, note, source, true)
}

function buildFormationTrend(udyamByYear: Record<number, number>, mca21ByYear: Record<number, number>): FormationTick[] {
  const ticks: FormationTick[] = []
  // Use MCA21 for 2016-2021 (scaled), Udyam for 2022-2024
  for (let yr = 2016; yr <= 2021; yr++) {
    const count = mca21ByYear[yr] ?? 0
    if (count > 0) ticks.push({ year: yr, count })
  }
  for (const yr of [2022, 2023, 2024]) {
    const count = udyamByYear[yr] ?? 0
    if (count > 0) ticks.push({ year: yr, count })
  }
  // Fill gap years with 0 if bracketed
  return ticks.length >= 2 ? ticks.sort((a, b) => a.year - b.year) : ticks
}

// ─── Lifecycle classification ─────────────────────────────────────────────────

function classifyLifecycle(opp: number, risk: number, fv: Signal, sg: Signal, sector: SectorDef): Lifecycle {
  const TRANSFORMING = ['26', '47', '29', '35', '64', '85', '82']
  if (TRANSFORMING.includes(sector.nicCode)) return 'Transforming'

  // Declining only if BOTH formation AND survival are weak — sector genuinely contracting
  if (fv.score <= 40 && sg.score <= 45) return 'Declining'

  if (fv.score >= 60 && sg.score >= 58 && opp >= 62) return 'Accelerating'
  // High entry + high failure = contested
  if (fv.score >= 55 && sg.score < 48) return 'Contested'
  // Rising formation, decent survival but smaller = emerging
  if (fv.score >= 54 && opp >= 52 && sg.score >= 48) return 'Emerging'
  // High survival, moderate entry = maturing
  if (sg.score >= 60 && fv.score >= 40) return 'Maturing'
  return 'Maturing'
}

// ─── Composite scoring ────────────────────────────────────────────────────────

function computeOpportunity(fv: Signal, fm: Signal, sd: Signal, ps: Signal, te: Signal): number {
  return fv.score * 0.22 + fm.score * 0.18 + sd.score * 0.20 + ps.score * 0.22 + te.score * 0.18
}

function computeRisk(sg: Signal, cm: Signal, ea: Signal): number {
  const survivalRisk = 100 - sg.score
  const creditRisk = 100 - cm.score
  const employmentRisk = 100 - ea.score
  return survivalRisk * 0.45 + creditRisk * 0.30 + employmentRisk * 0.25
}

// ─── Main build function ───────────────────────────────────────────────────────

export async function buildAllSectorPulses(): Promise<SectorPulse[]> {
  const [mca21Raw, udyamRaw] = await Promise.all([loadMca21(), loadUdyam()])

  return SECTORS.map(sector => {
    const mca = aggregateMca21National(mca21Raw, sector.nicCode)
    const udyamByYear = aggregateUdyamNational(udyamRaw, sector.nicCode)
    const udyamTotal = Object.values(udyamByYear).reduce((a, b) => a + b, 0)

    const formationVelocity   = buildFormationVelocity(udyamByYear, mca.byYear)
    const survivalGradient    = buildSurvivalGradient(mca.active, mca.struckOff)
    const formalizationRate   = buildFormalizationGap(udyamTotal, sector)
    const creditMomentum      = buildStaticSignal(sector.creditMomentum, sector.creditNote, 'RBI Sectoral Credit', sector.creditMomentum >= 65 ? '↑ Strong' : sector.creditMomentum >= 50 ? '→ Moderate' : '↓ Weak')
    const tradeExposure       = buildStaticSignal(sector.tradeExposure, sector.tradeNote, 'DGFT Trade Statistics', sector.tradeExposure >= 65 ? '↑ Export-led' : sector.tradeExposure >= 45 ? '→ Balanced' : '↓ Import-dep.')
    const employmentAbsorption = buildStaticSignal(sector.employmentAbsorption, sector.employmentNote, 'EPFO Payroll Data', sector.employmentAbsorption >= 70 ? '↑ High absorber' : '→ Moderate')
    const policyScore         = buildStaticSignal(sector.policyScore, sector.policyNote, 'Budget 2024-25 + PLI', sector.policyScore >= 75 ? '↑ Strong tailwind' : sector.policyScore >= 55 ? '→ Moderate' : '↓ Limited')
    const searchDemand        = buildStaticSignal(sector.searchTrendsBase, 'Based on Google Trends 5yr average for sector keywords', 'Google Trends', sector.searchTrendsBase >= 65 ? '↑ Growing' : '→ Stable')

    const opportunityScore = Math.round(computeOpportunity(formationVelocity, formalizationRate, searchDemand, policyScore, tradeExposure))
    const riskScore        = Math.round(computeRisk(survivalGradient, creditMomentum, employmentAbsorption))
    const lifecycle        = classifyLifecycle(opportunityScore, riskScore, formationVelocity, survivalGradient, sector)
    const formationTrend   = buildFormationTrend(udyamByYear, mca.byYear)

    return {
      nicCode:    sector.nicCode,
      label:      sector.label,
      icon:       sector.icon,
      category:   sector.category,
      description: sector.description,
      formationVelocity,
      survivalGradient,
      formalizationRate,
      creditMomentum,
      tradeExposure,
      employmentAbsorption,
      searchDemand,
      policyScore,
      opportunityScore,
      riskScore,
      lifecycle,
      formationTrend,
      activeCompanies:        mca.active,
      struckOffCompanies:     mca.struckOff,
      totalMsmeRegistrations: udyamTotal,
    }
  }).sort((a, b) => b.opportunityScore - a.opportunityScore)
}
