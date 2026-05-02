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
  stage: string
  difficulty_level: string
  revenue_model: string[]
  resources_needed: string[]
  tags: string[]
  featured: boolean
  published_at: string
  cover_image: CoverImage | null
  // detail-only fields
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

// Maps stored enum values to human-readable labels
export const BUDGET_LABELS: Record<string, string> = {
  under_1k:    'Under $1K',
  '1k_10k':    '$1K – $10K',
  '10k_50k':   '$10K – $50K',
  '50k_200k':  '$50K – $200K',
  '200k_plus': '$200K+',
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
  { value: 'under_1k',    label: 'Under $1K' },
  { value: '1k_10k',      label: '$1K – $10K' },
  { value: '10k_50k',     label: '$10K – $50K' },
  { value: '50k_200k',    label: '$50K – $200K' },
  { value: '200k_plus',   label: '$200K+' },
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
