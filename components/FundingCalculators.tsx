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
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-100 bg-slate-50">
        {[
          { id: 'mudra', label: 'MUDRA Loan' },
          { id: 'cgtmse', label: 'CGTMSE' },
          { id: 'pmegp', label: 'PMEGP Subsidy' },
          { id: 'emi', label: 'EMI Calculator' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`px-4 sm:px-5 py-3 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white text-indigo-700 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
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

      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">You qualify for the {tier.name} category</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{inr(amount)}</p>
        <p className="mt-3 text-sm text-slate-600">{tier.range} · Interest {tier.rate} · Tenure {tier.tenure}</p>
      </div>

      <Stat label="Eligible">{eligible ? 'Yes — apply via any public sector bank, NBFC or RRB' : 'Above MUDRA cap; consider CGTMSE'}</Stat>

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
        <label className="block text-sm font-medium text-slate-700 mb-2">Borrower category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as 'general' | 'micro' | 'women_ne')}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="general">General</option>
          <option value="micro">Micro enterprise</option>
          <option value="women_ne">Women / SC-ST / NE / Aspirational district</option>
        </select>
      </div>

      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
        {cover ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Guarantee cover</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{cover.pct}% — {inr(guaranteed)}</p>
            <p className="mt-3 text-sm text-slate-600">{cover.label}</p>
          </>
        ) : (
          <p className="text-sm text-slate-700">Loan exceeds CGTMSE cap of ₹5 Cr.</p>
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
          <label className="block text-sm font-medium text-slate-700 mb-2">Sector</label>
          <select value={sector} onChange={e => setSector(e.target.value as 'mfg' | 'service')}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800">
            <option value="mfg">Manufacturing (max ₹50L)</option>
            <option value="service">Service / Trading (max ₹20L)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
          <select value={area} onChange={e => setArea(e.target.value as 'urban' | 'rural')}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800">
            <option value="urban">Urban</option>
            <option value="rural">Rural</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={special} onChange={e => setSpecial(e.target.checked)} />
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
        <p className="text-sm text-amber-600">
          Note: project cost capped at {inr(cap)} for {sector === 'mfg' ? 'manufacturing' : 'service / trading'} under PMEGP.
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
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
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
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-base font-bold text-indigo-700">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-indigo-600"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 text-sm">
      <span className="text-slate-500">{label}:</span>
      <span className="font-medium text-slate-800">{children}</span>
    </div>
  )
}

function Card({ label, value, accent, sub }: { label: string; value: string; accent: 'green' | 'amber' | 'indigo'; sub?: string }) {
  const styles = {
    green: 'border-green-100 bg-green-50 text-green-800',
    amber: 'border-amber-100 bg-amber-50 text-amber-800',
    indigo: 'border-indigo-100 bg-indigo-50 text-indigo-800',
  }[accent]
  return (
    <div className={`rounded-xl border ${styles} p-4`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-70">{sub}</p>}
    </div>
  )
}

function Notes({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-0.5 text-slate-400">•</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}
