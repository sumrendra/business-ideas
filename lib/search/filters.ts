import {
  BUDGET_OPTIONS,
  DIFFICULTY_OPTIONS,
  INDUSTRIES,
  STAGE_OPTIONS,
} from '@/lib/sanity/types'
import type { FilterSearchDoc } from './types'

function industrySlug(industry: string): string {
  return industry.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

export const FILTERS_CATALOG: FilterSearchDoc[] = [
  ...INDUSTRIES.map<FilterSearchDoc>((industry) => ({
    kind: 'filter',
    filterKind: 'industry',
    slug: `industry-${industrySlug(industry)}`,
    value: industry,
    label: industry,
    title: `${industry}`,
    href: `/business-ideas?industry=${encodeURIComponent(industry)}`,
  })),
  ...BUDGET_OPTIONS.map<FilterSearchDoc>((opt) => ({
    kind: 'filter',
    filterKind: 'budget',
    slug: `budget-${opt.value}`,
    value: opt.value,
    label: opt.label,
    title: opt.label,
    href: `/business-ideas?budget=${opt.value}`,
  })),
  ...DIFFICULTY_OPTIONS.map<FilterSearchDoc>((opt) => ({
    kind: 'filter',
    filterKind: 'difficulty',
    slug: `difficulty-${opt.value}`,
    value: opt.value,
    label: opt.label,
    title: opt.label,
    href: `/business-ideas?difficulty=${opt.value}`,
  })),
  ...STAGE_OPTIONS.map<FilterSearchDoc>((opt) => ({
    kind: 'filter',
    filterKind: 'stage',
    slug: `stage-${opt.value}`,
    value: opt.value,
    label: opt.label,
    title: opt.label,
    href: `/business-ideas?saturation=${opt.value}`,
  })),
]
