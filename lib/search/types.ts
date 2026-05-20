export type SearchKind = 'idea' | 'post' | 'tool' | 'filter'

export interface IdeaSearchDoc {
  kind: 'idea'
  slug: string
  title: string
  industry?: string
  tags?: string[]
  budget_range?: string
  difficulty_level?: string
  featured?: boolean
  cover?: string | null
}

export interface PostSearchDoc {
  kind: 'post'
  slug: string
  title: string
  category?: string
  tags?: string[]
  featured?: boolean
  cover?: string | null
}

export interface ToolSearchDoc {
  kind: 'tool'
  slug: string
  title: string
  href: string
  description: string
  keywords: string[]
}

export type FilterKind = 'industry' | 'budget' | 'difficulty' | 'stage'

export interface FilterSearchDoc {
  kind: 'filter'
  slug: string
  title: string
  filterKind: FilterKind
  value: string
  label: string
  href: string
}

export type SearchDoc = IdeaSearchDoc | PostSearchDoc | ToolSearchDoc | FilterSearchDoc

export interface SearchIndex {
  ideas: IdeaSearchDoc[]
  posts: PostSearchDoc[]
  tools: ToolSearchDoc[]
  filters: FilterSearchDoc[]
}
