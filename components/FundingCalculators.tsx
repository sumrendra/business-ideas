'use client'

import { useMemo, useState } from 'react'

type Tab = 'mudra' | 'cgtmse' | 'pmegp' | 'emi'

const inr = (n: number) => {
  if (!isFinite(n) || n <= 0) return '—'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

export default function FundingCalculators() {
  const [tab, setTab] = useState<Tab>('mudra')

  return (
    <section className="rounded-2xl border border-line bg-surface overflow-hidden dark:border-line-dark dark:bg-surface-dark">
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-line bg-surface-sunk dark:border-line-dark dark:bg-surface-dark-raised">
        {[
          { id: 'mudra', label: 'MUDRA Loan' },
          { id: 'cgtmse', label: 'CGTMSE' },
          { id: 'pmegp', label: 'PMEGP Subsidy' },
          { id: 'emi', label: 'EMI Calculator' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`px-4 sm:px-5 min-h-[44px] py-3 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-surface text-brand-600 border-b-2 border-brand-600 dark:bg-surface-dark dark:text-white'
                : 'text-ink-soft hover:text-ink dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        {tab === 'mudra' && <MudraCalc />}
        {tab === 'cgtmse' && <CgtmseCalc />}
        {tab === 'pmegp' && <PmegpCalc />}
        {tab === 'emi' && <EmiCalc />}
      </div>
    </section>
  )
}

// ── MUDRA ────────────────────────────────────────────────────────────────────
function MudraCalc() {
  const [amount, setAmount] = useState(500000)

  const tier = useMemo(() => {
    if (amount <= 50000) return { name: 'Shishu', range: 'up to ₹50,000', rate: '8.0–10.5%', tenure: '3–5 years' }
    if (amount <= 500000) return { name: 'Kishor', range: '₹50,001 – ₹5L', rate: '9.0–11.5%', tenure: '3–5 years' }
    if (amount <= 1000000) return { name: 'Tarun', range: '₹5L – ₹10L', rate: '10.0–12.5%', tenure: '5–7 years' }
    return { name: 'Tarun Plus', range: '₹10L – ₹20L', rate: '11.0–13.0%', tenure: '5–7 years (existing borrowers)' }
  }, [amount])

  const eligible = amount > 0 && amount <= 2000000

  return (
    <div className="space-y-6">
      <Header
        title="MUDRA Loan Eligibility"
        subtitle="Pradhan Mantri MUDRA Yojana — collateral-free loans for non-farm micro and small enterprises"
      />

      <Slider
        label="Loan amount needed"
        value={amount}
        min={10000}
        max={2000000}
        step={10000}
        format={inr}
        onChange={setAmount}
      />

      <div className="rounded-xl border border-line bg-surface-sunk p-5 dark:border-line-dark dark:bg-surface-dark-raised">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-600">You qualify for the {tier.name} category</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-ink dark:text-white">{inr(amount)}</p>
        <p className="mt-3 text-sm tabular-nums text-ink-soft dark:text-slate-400">{tier.range} · Interest {tier.rate} · Tenure {tier.tenure}</p>
      </div>

      <Stat label="Eligible" status={eligible ? 'positive' : 'caution'}>{eligible ? 'Yes — apply via any public sector bank, NBFC or RRB' : 'Above MUDRA cap; consider CGTMSE'}</Stat>

      <Notes
        items={[
          'Available to proprietorships, partnerships and small companies in manufacturing, trading and services',
          'No collateral required — guaranteed by CGFMU',
          'Apply at https://udyamimitra.in or directly at any participating bank',
        ]}
      />
    </div>
  )
}

// ── CGTMSE ───────────────────────────────────────────────────────────────────
function CgtmseCalc() {
  const [amount, setAmount] = useState(2500000)
  const [category, setCategory] = useState<'general' | 'micro' | 'women_ne'>('general')

  const cap = 50000000 // ₹5 Cr

  const cover = useMemo(() => {
    if (amount > cap) return null
    if (category === 'women_ne') return { pct: 90, label: 'Women, SC/ST, NE region & Aspirational districts' }
    if (category === 'micro') return { pct: 85, label: 'Micro enterprises' }
    if (amount <= 500000) return { pct: 85, label: 'Loans up to ₹5L' }
    if (amount <= 5000000) return { pct: 75, label: 'Loans ₹5L – ₹50L' }
    return { pct: 50, label: 'Loans above ₹50L' }
  }, [amount, category])

  const guaranteed = cover ? (amount * cover.pct) / 100 : 0

  return (
    <div className="space-y-6">
      <Header
        title="CGTMSE Cover Estimator"
        subtitle="Credit Guarantee Fund — collateral-free credit up to ₹5 Cr for MSMEs"
      />

      <Slider
        label="Loan amount"
        value={amount}
        min={100000}
        max={50000000}
        step={100000}
        format={inr}
        onChange={setAmount}
      />

      <div>
        <label className="block text-sm font-medium text-ink-soft mb-2 dark:text-slate-300">Borrower category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as 'general' | 'micro' | 'women_ne')}
          className="w-full min-h-[44px] rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-line-dark dark:bg-surface-dark-raised dark:text-white"
        >
          <option value="general">General</option>
          <option value="micro">Micro enterprise</option>
          <option value="women_ne">Women / SC-ST / NE / Aspirational district</option>
        </select>
      </div>

      <div className="rounded-xl border border-line bg-surface-sunk p-5 dark:border-line-dark dark:bg-surface-dark-raised">
        {cover ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Guarantee cover</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-ink dark:text-white">{cover.pct}% — {inr(guaranteed)}</p>
            <p className="mt-3 text-sm text-ink-soft dark:text-slate-400">{cover.label}</p>
          </>
        ) : (
          <p className="flex items-start gap-1.5 text-sm text-alert">
            <span aria-hidden="true">⚠</span>
            <span>Loan exceeds CGTMSE cap of ₹5 Cr.</span>
          </p>
        )}
      </div>

      <Notes
        items={[
          'Lender pays an annual guarantee fee (1.0–1.35% on outstanding) — typically passed through to borrower as a small spread',
          'CGTMSE is a guarantee scheme, not a loan — apply through a member lending institution (most banks + many NBFCs)',
          'Eligible borrower: any new or existing MSME engaged in manufacturing or service activity (excluding retail)',
        ]}
      />
    </div>
  )
}

// ── PMEGP ────────────────────────────────────────────────────────────────────
function PmegpCalc() {
  const [project, setProject] = useState(1500000)
  const [sector, setSector] = useState<'mfg' | 'service'>('mfg')
  const [area, setArea] = useState<'urban' | 'rural'>('urban')
  const [special, setSpecial] = useState(false)

  const cap = sector === 'mfg' ? 5000000 : 2000000

  const subsidyPct = special
    ? area === 'urban' ? 25 : 35
    : area === 'urban' ? 15 : 25

  const ownContribPct = special ? 5 : 10

  const eligibleProject = Math.min(project, cap)
  const subsidy = (eligibleProject * subsidyPct) / 100
  const ownContrib = (eligibleProject * ownContribPct) / 100
  const bankLoan = eligibleProject - subsidy - ownContrib

  return (
    <div className="space-y-6">
      <Header
        title="PMEGP Subsidy Calculator"
        subtitle="Prime Minister's Employment Generation Programme — capital subsidy + bank loan for new units"
      />

      <Slider
        label="Total project cost"
        value={project}
        min={50000}
        max={5000000}
        step={50000}
        format={inr}
        onChange={setProject}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2 dark:text-slate-300">Sector</label>
          <select value={sector} onChange={e => setSector(e.target.value as 'mfg' | 'service')}
            className="w-full min-h-[44px] rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-line-dark dark:bg-surface-dark-raised dark:text-white">
            <option value="mfg">Manufacturing (max ₹50L)</option>
            <option value="service">Service / Trading (max ₹20L)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2 dark:text-slate-300">Location</label>
          <select value={area} onChange={e => setArea(e.target.value as 'urban' | 'rural')}
            className="w-full min-h-[44px] rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-line-dark dark:bg-surface-dark-raised dark:text-white">
            <option value="urban">Urban</option>
            <option value="rural">Rural</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex min-h-[44px] items-center gap-2 text-sm text-ink-soft dark:text-slate-300">
            <input type="checkbox" checked={special} onChange={e => setSpecial(e.target.checked)} className="accent-brand-600" />
            Special category (SC/ST/OBC, Women, PH, Minorities, NER)
          </label>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card label="Government Subsidy" value={inr(subsidy)} accent="green" sub={`${subsidyPct}% margin money`} />
        <Card label="Your Own Contribution" value={inr(ownContrib)} accent="amber" sub={`${ownContribPct}% required`} />
        <Card label="Bank Loan (term + WC)" value={inr(bankLoan)} accent="indigo" sub={`${100 - subsidyPct - ownContribPct}% from lender`} />
      </div>

      {project > cap && (
        <p className="flex items-start gap-1.5 text-sm text-caution">
          <span aria-hidden="true">⚠</span>
          <span>
            Note: project cost capped at <span className="tabular-nums">{inr(cap)}</span> for {sector === 'mfg' ? 'manufacturing' : 'service / trading'} under PMEGP.
          </span>
        </p>
      )}

      <Notes
        items={[
          'Apply through KVIC, KVIB or DIC via https://kviconline.gov.in/pmegpeportal',
          'Only new units — existing businesses are not eligible',
          'Unit must run for 3 years post-disbursal for subsidy to be released from term-deposit lock-in',
        ]}
      />
    </div>
  )
}

// ── EMI ──────────────────────────────────────────────────────────────────────
function EmiCalc() {
  const [principal, setPrincipal] = useState(1000000)
  const [rate, setRate] = useState(11)
  const [years, setYears] = useState(5)

  const months = years * 12
  const r = rate / 100 / 12

  const emi = useMemo(() => {
    if (r === 0) return principal / months
    return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  }, [principal, r, months])

  const total = emi * months
  const interest = total - principal

  return (
    <div className="space-y-6">
      <Header title="Loan EMI Calculator" subtitle="Estimate your monthly payment, total interest and full repayment" />

      <Slider label="Loan amount" value={principal} min={50000} max={20000000} step={50000} format={inr} onChange={setPrincipal} />
      <Slider label="Interest rate (% per annum)" value={rate} min={6} max={24} step={0.25} format={v => `${v}%`} onChange={setRate} />
      <Slider label="Tenure (years)" value={years} min={1} max={20} step={1} format={v => `${v} ${v === 1 ? 'year' : 'years'}`} onChange={setYears} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card label="Monthly EMI" value={inr(emi)} accent="indigo" />
        <Card label="Total Interest" value={inr(interest)} accent="amber" />
        <Card label="Total Repayment" value={inr(total)} accent="green" />
      </div>

      <Notes
        items={[
          'Estimates assume fixed-rate, equated monthly instalments. Actual EMI may differ based on processing fees and rate revisions.',
          'For floating-rate loans, EMI typically resets when the lender revises the benchmark (RLLR / MCLR).',
        ]}
      />
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-xl font-bold tracking-tight text-ink dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">{subtitle}</p>
    </div>
  )
}

function Slider({
  label, value, min, max, step, format, onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm font-medium text-ink-soft dark:text-slate-300">{label}</label>
        <span className="text-base font-bold tabular-nums text-brand-600">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-brand-600"
      />
      <div className="mt-1 flex justify-between text-xs tabular-nums text-ink-soft dark:text-slate-500">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

function Stat({ label, children, status }: { label: string; children: React.ReactNode; status?: 'positive' | 'caution' }) {
  const tone =
    status === 'positive'
      ? 'text-positive'
      : status === 'caution'
        ? 'text-caution'
        : 'text-ink dark:text-slate-200'
  const icon = status === 'positive' ? '✓' : status === 'caution' ? '⚠' : null
  return (
    <div className="flex items-baseline gap-3 text-sm">
      <span className="text-ink-soft dark:text-slate-400">{label}:</span>
      <span className={`flex items-center gap-1.5 font-medium ${tone}`}>
        {icon && <span aria-hidden="true">{icon}</span>}
        <span>{children}</span>
      </span>
    </div>
  )
}

function Card({ label, value, accent, sub }: { label: string; value: string; accent: 'green' | 'amber' | 'indigo'; sub?: string }) {
  // Numbers are the hero: flat stat tile (hairline border), semantic color on the
  // figure only — green = money received, amber = cost/caution, indigo = neutral.
  const valueTone = {
    green: 'text-positive',
    amber: 'text-caution',
    indigo: 'text-brand-600',
  }[accent]
  const icon = accent === 'green' ? '✓' : accent === 'amber' ? '⚠' : null
  return (
    <div className="rounded-xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-slate-400">
        {icon && <span aria-hidden="true">{icon}</span>}
        <span>{label}</span>
      </p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${valueTone}`}>{value}</p>
      {sub && <p className="mt-1 text-xs tabular-nums text-ink-soft dark:text-slate-400">{sub}</p>}
    </div>
  )
}

function Notes({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 rounded-xl border border-line bg-surface-sunk p-4 text-xs text-ink-soft dark:border-line-dark dark:bg-surface-dark-raised dark:text-slate-400">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-0.5 text-ink-soft dark:text-slate-500" aria-hidden="true">•</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}
