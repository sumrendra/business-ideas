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
  // detail-only fields
  introduction?: unknown[]
  target_audience?: unknown[]
  why_it_works?: unknown[]
  scope_in_india?: unknown[]
  things_to_note?: string[]
  current_landscape?: unknown[]
  gross_margin?: string
  setup_cost_range?: string
  pivot_options?: string
  financing_options?: string
  pros?: string[]
  cons?: string[]
  problem?: unknown[]
  solution?: unknown[]
  seo_title?: string
  seo_description?: string
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
  // detail-only fields
  body?: unknown[]
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
