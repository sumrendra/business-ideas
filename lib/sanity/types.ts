export interface CoverImage {
  asset: { url: string }
  alt: string
}

export interface Idea {
  _id: string
  title: string
  slug: string
  description: string
  budget_range: string
  industry: string
  market_saturation: string
  difficulty_level: string
  stage: string
  revenue_model: string[]
  resources_needed: string[]
  tags: string[]
  featured: boolean
  published_at: string
  cover_image: CoverImage | null
  _updatedAt?: string
  // detail-only fields
  introduction?: unknown[]
  target_audience?: unknown[]
  why_it_works?: unknown[]
  scope_in_india?: unknown[]
  things_to_note?: string[]
  current_landscape?: unknown[]
  monthly_revenue_range?: string
  time_to_first_revenue?: string
  breakeven_timeline?: string
  licenses_required?: string[]
  demand_signal?: string
  first_step?: string
  gross_margin?: string
  setup_cost_range?: string
  pivot_options?: string
  financing_options?: string
  pros?: string[]
  cons?: string[]
  problem?: unknown[]
  solution?: unknown[]
  proof_points?: ProofPoint[]
  unit_economics?: {
    cac?: string; ltv?: string; ltv_cac_ratio?: string
    avg_order_value?: string; churn_rate?: string; payback_period?: string; context?: string
  }
  competitors?: {
    _key: string; name: string; type?: string; city?: string
    funding_raised?: string; revenue_signal?: string; differentiator?: string
    description?: string
  }[]
  google_trends_keyword?: string
  trend_data?: {
    monthly_values?: string
    direction?: 'Growing' | 'Stable' | 'Declining' | 'Seasonal'
    summary?: string
    peak_month?: string
  }
  regulatory_table?: {
    _key: string; name: string; authority?: string; cost?: string
    processing_time?: string; mandatory?: boolean; portal?: string
  }[]
  case_study?: {
    founder_name?: string; business_name?: string; city?: string; started_year?: string
    revenue_6m?: string; revenue_12m?: string; team_size?: string
    key_insight?: string; biggest_mistake?: string; source_url?: string
  }
  kpis?: { _key: string; metric: string; target: string; timeframe: string; category: string }[]
  risks_detailed?: { _key: string; title: string; severity: 'High' | 'Medium' | 'Low'; impact: string; mitigation: string }[]
  execution_plan?: { month_1: string[]; month_2: string[]; month_3: string[] }
  seo_title?: string
  seo_description?: string
}

export interface ProofPoint {
  _key: string
  type: 'Case Study' | 'Market Data' | 'Government Source'
  source: string
  url?: string
  headline: string
  founder?: string
  key_stat?: string
  quote?: string
}

export interface Post {
  _id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string[]
  featured: boolean
  published_at: string
  cover_image: CoverImage | null
  _updatedAt?: string
  author?: string
  reading_time?: number
  // detail-only fields
  body?: unknown[]
  faqs?: { question: string; answer: string }[]
  seo_title?: string
  seo_description?: string
}

// ── Label maps ────────────────────────────────────────────────────────────────

export const BUDGET_LABELS: Record<string, string> = {
  under_1l:  'Under ₹1 Lakh',
  '1l_10l':  '₹1L – ₹10L',
  '10l_50l': '₹10L – ₹50L',
  '50l_2cr': '₹50L – ₹2Cr',
  '2cr_plus':'₹2 Crore+',
}

export const MARKET_SATURATION_LABELS: Record<string, string> = {
  concept:     'Concept Stage',
  validated:   'Validated',
  competitive: 'Competitive',
  proven:      'Proven Market',
}

export const STAGE_LABELS: Record<string, string> = {
  concept:     'Raw Concept',
  validated:   'Validated',
  competitive: 'Has Competitors',
  mvp_ready:   'MVP Possible',
  proven:      'Proven Market',
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
  expert:       'Expert',
}

// ── Filter options ────────────────────────────────────────────────────────────

export const INDUSTRIES = [
  'SaaS',
  'E-commerce',
  'Health & Wellness',
  'EdTech',
  'FinTech',
  'Creator Economy',
  'Local Services',
  'Climate / Sustainability',
  'AI / ML',
  'AgriTech & Food',
  'Manufacturing',
  'Travel & Hospitality',
  'B2B Services',
  'Real Estate & PropTech',
  'Pet & Animal Care',
  'Logistics & Supply Chain',
  'Export & Trade',
  'Other',
]

export const BUDGET_OPTIONS = [
  { value: 'under_1l',  label: 'Under ₹1 Lakh' },
  { value: '1l_10l',    label: '₹1L – ₹10L' },
  { value: '10l_50l',   label: '₹10L – ₹50L' },
  { value: '50l_2cr',   label: '₹50L – ₹2Cr' },
  { value: '2cr_plus',  label: '₹2 Crore+' },
]

export const MARKET_SATURATION_OPTIONS = [
  { value: 'concept',     label: 'Concept Stage' },
  { value: 'validated',   label: 'Validated' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'proven',      label: 'Proven Market' },
]

export const STAGE_OPTIONS = [
  { value: 'concept',     label: 'Raw Concept' },
  { value: 'validated',   label: 'Validated' },
  { value: 'competitive', label: 'Has Competitors' },
  { value: 'mvp_ready',   label: 'MVP Possible' },
  { value: 'proven',      label: 'Proven Market' },
]

export const DIFFICULTY_OPTIONS = [
  { value: 'beginner',     label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced',     label: 'Advanced' },
  { value: 'expert',       label: 'Expert' },
]

export const BLOG_CATEGORIES = [
  'Entrepreneurship',
  'Market Research',
  'Funding & Finance',
  'Marketing & Growth',
  'Technology',
  'Operations',
  'Mindset',
  'Case Studies',
]

// ── Startups ──────────────────────────────────────────────────────────────────

export interface StartupFounder {
  _id: string
  name: string
  slug: string
  short_bio?: string
  long_bio?: unknown[]
  photo?: CoverImage | null
  linkedin_url?: string
  twitter_handle?: string
  personal_site?: string
  background?: string[]
  hometown?: string
  verified?: boolean
  data_sources?: { _key?: string; source?: string; url?: string; last_fetched?: string }[]
  last_updated_at?: string
}

export interface FinancialSnapshot {
  _key?: string
  fiscal_year: string
  revenue?: number
  profit?: number
  ebitda?: number
  burn_monthly?: number
  employee_count?: number
  valuation?: number
  currency?: string
  source?: string
  source_url?: string
}

export interface FundingRound {
  _key?: string
  date: string
  round_type?: string
  amount?: number
  amount_usd?: number
  lead_investor?: string
  all_investors?: string[]
  valuation_at_round?: number
  source_url?: string
}

export interface StartupMilestone {
  _key?: string
  date?: string
  title: string
  description?: string
  source_url?: string
}

export interface Startup {
  _id: string
  name: string
  legal_name?: string
  slug: string
  cin?: string
  logo?: CoverImage | null
  cover_image?: CoverImage | null
  website?: string
  founded_year?: number
  hq_city?: string
  hq_state?: string
  country?: string

  industry?: string
  sub_industry?: string
  business_model?: string
  stage?: string                     // funding stage (see STARTUP_STAGE_LABELS)
  status?: string                    // operating status (see STARTUP_STATUS_LABELS)

  founders?: StartupFounder[]        // dereferenced via GROQ ->
  key_executives?: { _key?: string; name: string; title?: string; linkedin_url?: string }[]
  board?: { _key?: string; name: string; role?: string; din?: string }[]

  tagline?: string
  short_description?: string
  long_story?: unknown[]
  milestones?: StartupMilestone[]

  financials?: FinancialSnapshot[]
  total_funding_raised?: number
  latest_valuation?: number
  funding_rounds?: FundingRound[]

  tags?: string[]
  competitors?: { _id: string; name: string; slug: string; logo?: CoverImage | null }[]
  related_ideas?: { _id: string; title: string; slug: string }[]
  parent_company?: { _id: string; name: string; slug: string } | null

  seo_title?: string
  seo_description?: string
  og_image?: CoverImage | null

  data_sources?: { _key?: string; source: string; url?: string; last_fetched?: string }[]
  verified?: boolean
  featured?: boolean
  last_updated_at?: string
  published_at?: string
  _updatedAt?: string
}

// Funding stages — note "Series A" overlaps the existing STAGE_LABELS keys for
// businessIdea, but the value namespace is distinct so they don't collide.
export const STARTUP_STAGE_LABELS: Record<string, string> = {
  bootstrapped:  'Bootstrapped',
  pre_seed:      'Pre-seed',
  seed:          'Seed',
  series_a:      'Series A',
  series_b:      'Series B',
  series_c:      'Series C',
  series_d_plus: 'Series D+',
  unicorn:       'Unicorn',
  ipo:           'IPO',
  listed:        'Listed',
}

export const STARTUP_STAGE_OPTIONS = Object.entries(STARTUP_STAGE_LABELS)
  .map(([value, label]) => ({ value, label }))

export const STARTUP_STATUS_LABELS: Record<string, string> = {
  active:    'Active',
  acquired:  'Acquired',
  shut_down: 'Shut Down',
  stealth:   'Stealth',
}

export const STARTUP_STATUS_OPTIONS = Object.entries(STARTUP_STATUS_LABELS)
  .map(([value, label]) => ({ value, label }))

export const BUSINESS_MODEL_LABELS: Record<string, string> = {
  b2b_saas:         'B2B SaaS',
  b2c_subscription: 'B2C Subscription',
  d2c:              'D2C Brand',
  marketplace:      'Marketplace',
  ecommerce:        'E-commerce',
  fintech_lending:  'Fintech (Lending)',
  fintech_payments: 'Fintech (Payments)',
  aggregator:       'Aggregator',
  service:          'Service / Agency',
  hardware:         'Hardware / IoT',
  media:            'Media / Content',
  other:            'Other',
}

export const BUSINESS_MODEL_OPTIONS = Object.entries(BUSINESS_MODEL_LABELS)
  .map(([value, label]) => ({ value, label }))

// Funding-band buckets used by the listing filter.
// Values in INR; null = no upper bound.
export const FUNDING_RANGE_OPTIONS = [
  { value: 'bootstrapped', label: 'Bootstrapped',     min: 0,            max: 0 },
  { value: 'under_1cr',    label: 'Under ₹1 Cr',      min: 1,            max: 1_00_00_000 },
  { value: '1cr_10cr',     label: '₹1 Cr – ₹10 Cr',   min: 1_00_00_000,  max: 10_00_00_000 },
  { value: '10cr_100cr',   label: '₹10 Cr – ₹100 Cr', min: 10_00_00_000, max: 100_00_00_000 },
  { value: '100cr_plus',   label: '₹100 Cr+',         min: 100_00_00_000, max: null as number | null },
] as const
