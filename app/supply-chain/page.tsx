'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Supplier { name: string; location: string; note: string }
interface Problem   { title: string; detail: string }
interface Tool      { name: string; type: string; cost: string }

interface ChainNode {
  id: string
  stage: string
  icon: string
  tagline: string
  accent: string          // tailwind colour token
  isYou?: boolean
  suppliers: Supplier[]
  costs: { label: string; value: string; note?: string }[]
  margin: { pct: string; context: string }
  problems: Problem[]
  tools: Tool[]
}

const CHAIN: ChainNode[] = [
  {
    id: 'chemicals',
    stage: 'Chemical & Consumable Suppliers',
    icon: '🧪',
    tagline: 'Cleaning agents · Anti-soiling coatings · DM/RO water',
    accent: 'violet',
    suppliers: [
      { name: 'Ion Exchange India', location: 'Mumbai', note: 'DM water plants & RO membranes — largest industrial water treatment co.' },
      { name: 'Tata Chemicals', location: 'Pan-India', note: 'Sodium lauryl sulphate base for panel cleaners; bulk industrial grade' },
      { name: 'Wacker Chemie India', location: 'Mumbai', note: 'Anti-soiling nano-coating (SILRES® BS Powder) — lasts 12–18 months' },
      { name: 'Local agri-chem distributors', location: 'Tier-2 cities', note: 'IPA, soft surfactants in 50L drums; 30–40% cheaper than B2B marketplaces' },
      { name: 'IndiaMart suppliers', location: 'Pan-India', note: 'Solar panel cleaning solution concentrate; MOQ usually 5–10L' },
    ],
    costs: [
      { label: 'Cleaning solution', value: '₹1,200–2,800/month', note: 'For 40–60 panel-visits/day operation' },
      { label: 'RO/DM water procurement', value: '₹800–2,000/month', note: 'Or ₹1.5–3L one-time for on-site RO plant' },
      { label: 'Anti-soiling coating', value: '₹18–35/sqm', note: 'Applied 1–2×/year; upsell to residential customers' },
      { label: 'Safety consumables', value: '₹500–1,200/month', note: 'Gloves, micro-fibre cloths, replacement brushes' },
    ],
    margin: { pct: '18–28%', context: 'Commoditised market — suppliers compete on price. Negotiate bulk-rate contracts once you cross 200+ visits/month.' },
    problems: [
      { title: 'Counterfeit cleaners damage panels', detail: 'Cheap chlorine-based cleaners cause micro-etching on anti-reflective coating, reducing efficiency 1–3% permanently. Always test on 2 panels before bulk order.' },
      { title: 'DM water unavailable in Tier-2', detail: 'Hard water (>500 ppm TDS) leaves white mineral deposits post-wash. Either invest in site RO (₹1.5L) or buy 20L cans (~₹60/can) from local water ATMs.' },
      { title: 'Storage and spoilage', detail: 'Most cleaning concentrates have 12-month shelf life. Over-ordering to hit MOQ leads to spoilage. Keep ≤4-week inventory.' },
    ],
    tools: [
      { name: 'IndiaMart', type: 'Procurement', cost: 'Free (supplier listings)' },
      { name: 'Udaan', type: 'B2B Marketplace', cost: 'Free; credit terms available' },
      { name: 'Zoho Inventory', type: 'Stock tracking', cost: '₹1,799/month' },
    ],
  },
  {
    id: 'equipment',
    stage: 'Equipment & Tools',
    icon: '🔧',
    tagline: 'Cleaning machines · Diagnostic tools · Safety gear · Vehicles',
    accent: 'blue',
    suppliers: [
      { name: 'Kärcher India', location: 'Bengaluru', note: 'K 2 / K 5 pressure washers (₹8,000–35,000); most reliable for solar cleaning use-case' },
      { name: 'Fluke Corporation', location: 'Delhi (distributor)', note: 'Clamp meters, multimeters, IV curve tracers — industry standard for solar diagnostics' },
      { name: 'FLIR Systems', location: 'Mumbai', note: 'Thermal imaging cameras (₹1.5L–6L); identifies hot cells, delamination, soiling patterns' },
      { name: 'Unger India', location: 'Mumbai', note: 'Water-fed pole systems & micro-fibre sleeves — best for rooftop residential up to 4 floors' },
      { name: 'Hero / TVS dealers', location: 'Pan-India', note: 'Two-wheelers for technician mobility; EMI available; ₹70K–1.1L' },
      { name: 'Waaree / Novergy', location: 'Gujarat / Mumbai', note: 'Spare inverter components, combiner boxes, MC4 connectors at OEM pricing' },
    ],
    costs: [
      { label: 'Pressure washer set', value: '₹8,000–35,000', note: 'One-time; rent for first 6 months to validate demand' },
      { label: 'Thermal camera', value: '₹1.5L–6L', note: 'Rent first (₹3,000–6,000/day via IndiaMart); buy when >15 C&I clients' },
      { label: 'IV curve tracer', value: '₹25,000–1.2L', note: 'SEAWARD, Solmetric, or local: needed for performance guarantee contracts' },
      { label: 'Vehicle (2-wheeler)', value: '₹70K–1.1L', note: 'One per technician; can use delivery partner platform bikes initially' },
      { label: 'Annual maintenance', value: '₹15,000–25,000/year', note: 'Service contracts for high-use equipment' },
    ],
    margin: { pct: '20–40%', context: 'Equipment dealers, not you — but renting vs buying is a 12-month payback decision. At 30+ residential visits/month, owning beats renting.' },
    problems: [
      { title: 'Thermal cameras are capex-heavy', detail: 'A quality FLIR E6 costs ₹2.5L+. Without it, you miss hot-spot detection — a key differentiator for C&I clients. Solve by partnering with a NABL-certified inspection lab and charging a ₹3,000–5,000 thermal audit fee.' },
      { title: 'Automated cleaning robots — not yet SME viable', detail: 'EcoloBlue, Miraikikai robots cost ₹4–12L each and need 500+ panels to justify. For SMEs, manual + water-fed poles is the right answer until you hit 50 kW under management.' },
      { title: 'Counterfeit spare parts', detail: 'Fake MC4 connectors from grey-market suppliers cause arc faults and fires. Only source from authorized Stäubli, Amphenol distributors or direct from inverter OEMs.' },
    ],
    tools: [
      { name: 'Rentickle / RentoMojo', type: 'Equipment Rental', cost: 'Pay-per-day; no capex' },
      { name: 'FieldAware', type: 'Asset tracking', cost: '₹2,500/month' },
      { name: 'GSTHero', type: 'Purchase reconciliation', cost: '₹1,500/month' },
    ],
  },
  {
    id: 'workforce',
    stage: 'Workforce & Training',
    icon: '👨‍🔧',
    tagline: 'Certified technicians · Electricians · Field supervisors',
    accent: 'amber',
    suppliers: [
      { name: 'NSDC Skill India Portal', location: 'Pan-India', note: 'SURYAMITRA scheme — MNRE-certified solar technicians (6-month course, ₹0 cost to student)' },
      { name: 'NISE (National Institute of Solar Energy)', location: 'Gurugram', note: 'Trains O&M technicians; certified batch available every quarter' },
      { name: 'ITI pass-outs (Electrician trade)', location: 'Pan-India', note: 'Best raw talent; need 2-week solar-specific on-the-job training' },
      { name: 'Apna.co / WorkIndia', location: 'App-based', note: 'Blue-collar hiring; filter for electrician background + 2-wheeler licence' },
      { name: 'TERI (The Energy and Resources Institute)', location: 'Delhi', note: 'Advanced O&M training for supervisors; good for C&I and utility clients who demand certified staff' },
    ],
    costs: [
      { label: 'Field technician salary', value: '₹12,000–18,000/month', note: 'Tier-2 cities; ₹18,000–28,000 in metros' },
      { label: 'In-house training', value: '₹800–1,500/person', note: 'Safety protocols, cleaning SOPs, basic electrical first aid — 3-day program' },
      { label: 'SURYAMITRA certification', value: '₹0', note: 'Subsidized by MNRE; adds ₹2,000–3,000 to technician\'s hiring asking price but worth it' },
      { label: 'Uniform + safety kit', value: '₹1,800–3,500/person', note: 'Helmet, gloves, safety harness, anti-slip shoes — mandatory; also builds brand trust on-site' },
    ],
    margin: { pct: 'N/A (cost centre)', context: 'Labour is your biggest variable cost — typically 35–45% of revenue. Key lever: route optimization. A well-routed team of 2 can do 30–40 residential visits/day vs 15–20 if poorly planned.' },
    problems: [
      { title: 'High churn — 40–60% annually', detail: 'Technicians get poached by solar installers or EPC firms offering ₹2,000–3,000 more. Counter with: performance bonus (₹300–500/day above target), ESIC/PF compliance (signals stability), and clear skill progression path to "Senior Technician" in 12 months.' },
      { title: 'Electrical safety incidents', detail: 'Solar panels are live even at night (ambient light). Untrained staff bypassing isolation protocols cause shocks. Mandatory: lockout-tagout training, insulated tools, and a ₹50L workmen\'s comp insurance policy (costs ~₹12,000/year for 5-person team).' },
      { title: 'No standardized solar maintenance curriculum', detail: 'NSDC\'s SURYAMITRA is the closest thing, but focus is installation, not O&M. You will need to build your own 3-day SOPs — this becomes a moat once documented.' },
    ],
    tools: [
      { name: 'Apna.co', type: 'Hiring platform', cost: 'Free (job posts)' },
      { name: 'greytHR', type: 'Payroll + compliance', cost: '₹1,495/month for 10 employees' },
      { name: 'Learnyst', type: 'Internal training LMS', cost: '₹2,500/month' },
    ],
  },
  {
    id: 'operations',
    stage: 'Your Service Operations',
    icon: '⚡',
    tagline: 'AMC contracts · Scheduling · Quality control · Reporting',
    accent: 'indigo',
    isYou: true,
    suppliers: [
      { name: 'Housing societies (residential)', location: 'Pan-India', note: '3–10 kW systems; ₹2,000–5,000/quarter AMC; acquired via RWA referrals and solar installer partnerships' },
      { name: 'Factories & warehouses (C&I)', location: 'Industrial zones', note: '50 kW–2 MW; ₹800–1,500/kW/year; acquired via energy auditors, MSME clusters, IndiaMart' },
      { name: 'Solar EPCs', location: 'Pan-India', note: 'White-label O&M contracts from installers who don\'t want to run O&M operations; steady pipeline' },
      { name: 'DISCOMs / net-metering customers', location: 'State-wise', note: 'Residential prosumers who want to maximize generation to reduce bills — performance-guarantee pitch works well' },
    ],
    costs: [
      { label: 'Customer acquisition (CAC)', value: '₹800–2,500/customer', note: 'Referral from solar installer: ₹200–400. Google Ads for residential: ₹1,500–3,000.' },
      { label: 'AMC delivery cost', value: '₹320–600/visit', note: 'Labour + chemicals + travel; covers 1 kW residential system (2 panels washed)' },
      { label: 'Software & operations', value: '₹4,000–9,000/month', note: 'CRM + scheduling + reporting stack for 5-person team' },
      { label: 'Insurance', value: '₹15,000–35,000/year', note: 'Professional indemnity + workmen\'s compensation + equipment floater' },
    ],
    margin: { pct: '38–55% net', context: 'This is your margin to defend. Residential: higher margin (60–70% gross) but small contracts. C&I: lower gross (40–50%) but large contracts. Performance-guarantee models earn 30% premium but require IV-tracer data.' },
    problems: [
      { title: 'Route inefficiency kills margin', detail: 'If technicians travel 4+ hours/day, your effective billing hours drop to <50%. Use Google Maps API or FieldAx to auto-cluster visits by zone. A well-optimized day: 8 residential visits in 2 housing colonies = ₹3,200 revenue for ₹800 cost.' },
      { title: 'Clients blame you for generation dips', detail: 'Grid curtailment, inverter issues, and shading are blamed on maintenance quality. Protect yourself: document before/after soiling ratio, get client sign-off on post-cleaning IV curve data, include a force-majeure clause in the AMC.' },
      { title: 'Seasonal demand collapse', detail: 'Monsoon = no cleaning needed (4 months). Plan: pre-book post-monsoon cleaning blitz in advance; use monsoon months for thermal audits, inverter servicing, and new client acquisition.' },
    ],
    tools: [
      { name: 'Zoho FSM', type: 'Field service management', cost: '₹1,800/month' },
      { name: 'FieldAx', type: 'Scheduling + mobile app', cost: '₹2,500/month' },
      { name: 'Razorpay', type: 'AMC billing & auto-debit', cost: '2% per transaction' },
      { name: 'WhatsApp Business API', type: 'Client communication', cost: '₹1,000–3,000/month' },
    ],
  },
  {
    id: 'monitoring',
    stage: 'Technology & Monitoring',
    icon: '📡',
    tagline: 'Remote SCADA · IoT sensors · Performance analytics',
    accent: 'cyan',
    suppliers: [
      { name: 'SolarEdge', location: 'Tel Aviv / Mumbai rep', note: 'Module-level monitoring with HD-Wave inverters; dashboard tracks each panel\'s output' },
      { name: 'Huawei FusionSolar', location: 'Shenzhen / Delhi office', note: 'Dominates India C&I installs; FusionSolar app is the de-facto monitoring standard at 100–500 kW' },
      { name: 'Enphase Energy', location: 'USA / Mumbai', note: 'Microinverter-based monitoring; strong in residential; Enlighten app beloved by users' },
      { name: 'Novatek Electro India', location: 'Pune', note: 'Local SCADA integrator; builds custom dashboards for utility-scale farms; ₹15–40L for full system' },
      { name: 'ThingsBoard (open source)', location: 'Cloud/self-hosted', note: 'Free IoT platform; good for startups building their own monitoring product on top of standard inverter APIs' },
    ],
    costs: [
      { label: 'Monitoring hardware (per site)', value: '₹3,000–8,000', note: 'Logger + sensor + SIM card; amortize over AMC contract length' },
      { label: 'SaaS monitoring fee', value: '₹500–2,000/site/year', note: 'Most inverter OEM platforms are free; third-party analytics (Solargraf, PVsyst) cost extra' },
      { label: 'Connectivity (SIM/WiFi)', value: '₹150–300/month/site', note: 'Airtel/Jio IoT SIM for remote sites; use WiFi bridge at industrial sites to save cost' },
      { label: 'Custom dashboard dev', value: '₹40,000–1.5L one-time', note: 'Freelancer on Upwork/Toptal; or use Grafana free tier on your own server' },
    ],
    margin: { pct: '40–70% (for tech add-on)', context: 'Remote monitoring is a high-margin upsell. If you charge ₹1,500/site/year for "Performance Monitoring Add-on" your cost is ₹300–500. Most residential clients will pay — loss of ₹800–1,200/month to soiling makes it easy to justify.' },
    problems: [
      { title: 'Inverter brand fragmentation', detail: 'A typical portfolio of 50 residential clients may have 8–10 different inverter brands (Growatt, Delta, ABB, Solis, Fronius, SMA, Goodwe, Solax…). Each has a different API or no API. Use a gateway device (e.g. SolarLog, Solarman) that aggregates all brands into one stream.' },
      { title: 'Connectivity in rural solar farms', detail: 'BSNL 4G coverage in many agri-solar or rural utility sites is poor. Solution: LoRa WAN mesh sensors (very low bandwidth, long range) for basic irradiance and temperature; full SCADA only where backhaul is reliable.' },
      { title: 'Clients don\'t pay for monitoring', detail: 'Residential clients often refuse to pay separately. Bundle it into the AMC price — position as "Digital Health Report" delivered monthly. Retention rates for monitored sites are 2.3× higher than unmonitored.' },
    ],
    tools: [
      { name: 'Solarman / SolarLog', type: 'Multi-inverter aggregator', cost: '₹5,000–12,000 hardware' },
      { name: 'ThingsBoard', type: 'Open-source IoT dashboard', cost: 'Free (self-hosted)' },
      { name: 'PVsyst', type: 'Performance ratio modelling', cost: '₹25,000/year licence' },
      { name: 'Grafana Cloud', type: 'Custom dashboards', cost: 'Free tier (10k metrics)' },
    ],
  },
  {
    id: 'customer',
    stage: 'End Customers',
    icon: '🏢',
    tagline: 'Residential · Commercial & Industrial · Utility-scale solar parks',
    accent: 'emerald',
    suppliers: [
      { name: 'Residential homeowners', location: 'Metro + Tier-1', note: '3–10 kW rooftop; 4.5M+ installed as of 2024; WTP ₹2,000–5,000/quarter; churn risk moderate' },
      { name: 'Housing societies (RWAs)', location: 'Metro cities', note: '10–100 kW common area solar; single AMC covers 50–300 flats; ₹8,000–35,000/quarter; excellent unit economics' },
      { name: 'Factories & warehouses', location: 'Industrial clusters', note: '100 kW–2 MW; energy cost sensitivity makes them best buyers; ₹800–1,500/kW/year; 3-year AMC standard' },
      { name: 'Hospitals & educational institutions', location: 'Pan-India', note: 'High uptime requirement = high willingness to pay for performance guarantee; ₹1,200–2,000/kW/year' },
      { name: 'IPPs / Solar park operators', location: 'Rajasthan, Gujarat, AP, Karnataka', note: '5 MW+ farms; tenders for O&M 3–5 year contracts; ₹400–800/kW/year; volume compensates for thin margins' },
    ],
    costs: [
      { label: 'Residential LTV', value: '₹12,000–20,000', note: 'Avg 2-year retention × ₹6,000–10,000/year AMC' },
      { label: 'C&I LTV', value: '₹1.5L–12L', note: '3-year contract × ₹50,000–4,00,000/year depending on system size' },
      { label: 'Payback period (new customer)', value: '2–4 months', note: 'CAC of ₹800–2,500 recovered in first 1–2 AMC visits' },
      { label: 'NPS benchmark', value: '42–58 (solar O&M)', note: 'Industry benchmark; exceeding it unlocks word-of-mouth in housing societies — best acquisition channel' },
    ],
    margin: { pct: 'N/A (revenue source)', context: 'Segment mix matters more than any other decision. 70% C&I + 30% residential is the optimal mix: C&I provides stable cash flow and predictable scheduling; residential provides margin and referral density.' },
    problems: [
      { title: 'Residential: price sensitivity & payment delays', detail: 'Many residential customers treat solar maintenance as optional. Strategy: offer a quarterly "Performance Statement" showing kWh saved + ₹ saved on electricity bill — makes value tangible. Offer auto-debit via Razorpay to eliminate payment friction.' },
      { title: 'C&I: long procurement cycles', detail: 'Factory procurement for AMC contracts can take 3–6 months (3 quotes, committee approval, L1 bidding). Keep a pipeline of 5× your target monthly revenue in proposals. Use energy auditors as channel partners — they introduce you post-audit.' },
      { title: 'Utility-scale: working capital crunch', detail: 'IPPs pay 60–90 days post-invoice (some 120 days). A ₹50L/month utility contract sounds great until you\'re funding 3 months of operations from your own pocket. Either use invoice discounting (Drip Capital, KredX) or stick to C&I with <30-day payment terms initially.' },
    ],
    tools: [
      { name: 'Mercom India', type: 'IPP & developer directory', cost: 'Free (public listings)' },
      { name: 'Housing.com / NoBroker', type: 'RWA leads', cost: 'Free (society listings)' },
      { name: 'IndiaMart', type: 'C&I lead generation', cost: '₹4,000–15,000/month' },
      { name: 'Zoho CRM', type: 'Pipeline management', cost: '₹1,300/user/month' },
    ],
  },
]

// Single-hue indigo treatment with a deliberate intensity ramp by chain position.
// All decorative rainbow hues collapse to the one brand accent (DESIGN.md "One Voice Rule");
// node identity now comes from icon + position, not from color.
const ACCENT_BASE = {
  ring: 'ring-indigo-400 dark:ring-indigo-600',
  bg: 'bg-indigo-50 dark:bg-indigo-950/30',
  text: 'text-indigo-700 dark:text-indigo-300',
  dot: 'bg-indigo-500',
  line: 'border-indigo-200 dark:border-indigo-800',
  tag: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
}

const ACCENT: Record<string, { ring: string; bg: string; text: string; dot: string; line: string; tag: string }> = {
  violet:  ACCENT_BASE,
  blue:    ACCENT_BASE,
  amber:   ACCENT_BASE,
  indigo:  ACCENT_BASE,
  cyan:    ACCENT_BASE,
  emerald: ACCENT_BASE,
}

type Tab = 'suppliers' | 'costs' | 'problems' | 'tools'

export default function SupplyChainPage() {
  const [active, setActive]   = useState<string>(CHAIN[3].id) // start on "Your Operations"
  const [tab, setTab]         = useState<Tab>('suppliers')

  const node = CHAIN.find(n => n.id === active)!
  const a    = ACCENT[node.accent]

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <nav className="mb-6 text-sm text-ink-soft dark:text-slate-400">
        <Link href="/" className="hover:text-brand-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-brand-600 dark:hover:text-indigo-400">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-ink dark:text-slate-300">Supply Chain</span>
      </nav>

      <header className="mb-10">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-brand-600 dark:text-indigo-400">Supply Chain Flow</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-ink dark:text-slate-100">
          ☀️ Solar Panel Maintenance
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft dark:text-slate-400">
          Full supply chain — from raw inputs to end customer. Click any node to explore suppliers, real costs, margins, common pitfalls, and the tools used at each stage.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">

        {/* ── LEFT: Flow chain ── */}
        <div className="relative">
          {CHAIN.map((n, i) => {
            const isActive = active === n.id
            const ac = ACCENT[n.accent]
            return (
              <div key={n.id} className="relative">
                {/* Connector line */}
                {i < CHAIN.length - 1 && (
                  <div className="absolute left-[27px] top-[60px] w-[2px] h-[calc(100%-4px)] z-0">
                    <div className="w-full h-full border-l-2 border-dashed border-line dark:border-line-dark" />
                    {/* Animated flow dot */}
                    <div
                      className={`absolute top-0 w-2 h-2 rounded-full -left-[3px] ${ac.dot} opacity-70`}
                      style={{ animation: `flowDot 2.5s linear ${i * 0.4}s infinite` }}
                    />
                  </div>
                )}

                <button
                  onClick={() => { setActive(n.id); setTab('suppliers') }}
                  className={`relative z-10 w-full flex items-center gap-4 rounded-2xl border-2 p-4 mb-4 text-left transition-all duration-200 ${
                    isActive
                      ? `${ac.ring} ring-2 ring-offset-2 dark:ring-offset-ink-dark ${ac.bg} border-transparent`
                      : 'border-line dark:border-line-dark bg-surface dark:bg-surface-dark hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-[0_6px_24px_-8px_rgba(22,24,29,0.12)]'
                  }`}
                >
                  {/* Icon circle */}
                  <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-xl transition-colors ${isActive ? ac.bg + ' ' + ac.dot.replace('bg-', 'ring-') : 'bg-surface-sunk dark:bg-surface-dark-raised'}`}>
                    {n.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold text-sm leading-tight transition-colors ${isActive ? ac.text : 'text-ink dark:text-slate-300'}`}>
                        {n.stage}
                      </p>
                      {n.isYou && (
                        <span className="rounded-full bg-brand-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">You</span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-soft dark:text-slate-500 mt-0.5 leading-tight line-clamp-1">{n.tagline}</p>
                  </div>

                  {isActive && (
                    <span className={`text-sm shrink-0 ${ac.text}`}>→</span>
                  )}
                </button>
              </div>
            )
          })}

          {/* Flow animation keyframes */}
          <style>{`
            @keyframes flowDot {
              0%   { transform: translateY(0);   opacity: 0; }
              10%  { opacity: 0.8; }
              90%  { opacity: 0.8; }
              100% { transform: translateY(72px); opacity: 0; }
            }
          `}</style>
        </div>

        {/* ── RIGHT: Detail panel ── */}
        <div className={`rounded-2xl border-2 ${a.line} ${a.bg} overflow-hidden`}>

          {/* Panel header */}
          <div className={`px-6 pt-6 pb-4 border-b ${a.line}`}>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{node.icon}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className={`text-xl font-bold ${a.text}`}>{node.stage}</h2>
                  {node.isYou && (
                    <span className="rounded-full bg-brand-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">Your business</span>
                  )}
                </div>
                <p className="text-sm text-ink-soft dark:text-slate-400 mt-0.5">{node.tagline}</p>
              </div>
            </div>

            {/* Margin pill */}
            <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${a.tag}`}>
              <span>Margin at this stage:</span>
              <span className="font-bold tabular-nums">{node.margin.pct}</span>
            </div>
            <p className="mt-2 text-xs text-ink-soft dark:text-slate-400 leading-relaxed">{node.margin.context}</p>
          </div>

          {/* Tabs */}
          <div className={`flex border-b ${a.line} px-6 pt-1`}>
            {([
              { key: 'suppliers', label: '🏭 Suppliers', count: node.suppliers.length },
              { key: 'costs',    label: '💰 Costs',    count: node.costs.length },
              { key: 'problems', label: '⚠️ Problems', count: node.problems.length },
              { key: 'tools',    label: '🛠 Tools',    count: node.tools.length },
            ] as { key: Tab; label: string; count: number }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`mr-1 pb-2 pt-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  tab === t.key
                    ? `border-current ${a.text}`
                    : 'border-transparent text-ink-soft dark:text-slate-500 hover:text-ink dark:hover:text-slate-300'
                }`}
              >
                {t.label}
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] tabular-nums ${tab === t.key ? a.tag : 'bg-surface-sunk dark:bg-surface-dark-raised text-ink-soft dark:text-slate-500'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">

            {tab === 'suppliers' && (
              <div className="space-y-3">
                {node.suppliers.map((s, i) => (
                  <div key={i} className="rounded-xl bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-ink dark:text-slate-200">{s.name}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${a.tag}`}>{s.location}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-soft dark:text-slate-400 leading-relaxed">{s.note}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'costs' && (
              <div className="space-y-3">
                {node.costs.map((c, i) => (
                  <div key={i} className="rounded-xl bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-4">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-medium text-ink dark:text-slate-300">{c.label}</p>
                      <p className={`text-sm font-bold shrink-0 tabular-nums ${a.text}`}>{c.value}</p>
                    </div>
                    {c.note && <p className="mt-1 text-xs text-ink-soft dark:text-slate-500 leading-relaxed">{c.note}</p>}
                  </div>
                ))}
              </div>
            )}

            {tab === 'problems' && (
              <div className="space-y-4">
                {node.problems.map((p, i) => (
                  <div key={i} className="rounded-xl bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-4">
                    <div className="flex items-start gap-2">
                      <span className="text-caution mt-0.5 shrink-0 text-base" aria-hidden="true">⚠</span>
                      <div>
                        <p className="font-semibold text-sm text-ink dark:text-slate-200">{p.title}</p>
                        <p className="mt-1.5 text-xs text-ink-soft dark:text-slate-400 leading-relaxed">{p.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'tools' && (
              <div className="grid sm:grid-cols-2 gap-3">
                {node.tools.map((t, i) => (
                  <div key={i} className="rounded-xl bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-4">
                    <p className="font-semibold text-sm text-ink dark:text-slate-200">{t.name}</p>
                    <p className={`text-[10px] font-medium mt-0.5 ${a.text}`}>{t.type}</p>
                    <p className="text-xs text-ink-soft dark:text-slate-500 mt-1.5 font-medium tabular-nums">{t.cost}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full chain summary strip */}
      <div className="mt-12 rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-6">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-soft dark:text-slate-500 mb-5">Full Chain at a Glance</p>
        <div className="flex flex-wrap items-center gap-0">
          {CHAIN.map((n, i) => {
            const ac = ACCENT[n.accent]
            return (
              <div key={n.id} className="flex items-center">
                <button
                  onClick={() => { setActive(n.id); setTab('suppliers') }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${active === n.id ? `${ac.bg} ${ac.text}` : 'text-ink-soft dark:text-slate-400 hover:text-ink dark:hover:text-slate-300'}`}
                >
                  <span>{n.icon}</span>
                  <span className="hidden sm:inline">{n.stage.split(' ').slice(0, 2).join(' ')}</span>
                  {n.isYou && <span className="rounded-full bg-brand-600 text-white text-[8px] font-bold px-1.5 py-0.5">YOU</span>}
                </button>
                {i < CHAIN.length - 1 && (
                  <span className="text-line dark:text-line-dark mx-1 text-sm">→</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-ink-soft dark:text-slate-600">
        Data compiled from MNRE reports, NSDC solar sector skill gap studies, Mercom India, NISE, and interviews with solar O&M operators. Costs are indicative for FY2024.
      </p>
    </div>
  )
}
