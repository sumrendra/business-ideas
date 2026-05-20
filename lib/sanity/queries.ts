import { groq } from 'next-sanity'

// ─── Shared projection fragments ─────────────────────────────────────────────

const IDEA_CARD_FIELDS = groq`
  _id,
  title,
  "slug": slug.current,
  description,
  budget_range,
  industry,
  market_saturation,
  stage,
  difficulty_level,
  revenue_model,
  tags,
  featured,
  published_at,
  monthly_revenue_range,
  time_to_first_revenue,
  "cover_image": cover_image { asset->{ url }, alt }
`

const POST_CARD_FIELDS = groq`
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  tags,
  featured,
  published_at,
  author,
  reading_time,
  "cover_image": cover_image { asset->{ url }, alt }
`

// ─── Business Ideas ───────────────────────────────────────────────────────────

export const IDEAS_QUERY = groq`
  *[
    _type == "businessIdea"
    && defined(slug.current)
    && defined(published_at)
    && ($industry    == "" || industry           == $industry)
    && ($budget      == "" || budget_range       == $budget)
    && ($saturation  == "" || market_saturation  == $saturation)
    && ($difficulty  == "" || difficulty_level   == $difficulty)
    && (count($tags) == 0  || count(tags[@ in $tags]) > 0)
    && ($search      == "" || [title, description, industry, tags[]] match $search)
  ] | order(featured desc, published_at desc) {
    ${IDEA_CARD_FIELDS}
  }
`

export const IDEA_BY_SLUG_QUERY = groq`
  *[_type == "businessIdea" && slug.current == $slug][0] {
    ${IDEA_CARD_FIELDS},
    _updatedAt,
    introduction,
    target_audience,
    why_it_works,
    scope_in_india,
    things_to_note,
    current_landscape,
    gross_margin,
    setup_cost_range,
    pivot_options,
    financing_options,
    pros,
    cons,
    problem,
    solution,
    resources_needed,
    monthly_revenue_range,
    time_to_first_revenue,
    breakeven_timeline,
    licenses_required,
    demand_signal,
    first_step,
    proof_points,
    kpis,
    risks_detailed,
    execution_plan,
    unit_economics,
    competitors,
    google_trends_keyword,
    trend_data,
    regulatory_table,
    case_study,
    seo_title,
    seo_description
  }
`

export const PEOPLE_ALSO_VIEWED_QUERY = groq`
  *[
    _type == "businessIdea"
    && defined(slug.current)
    && defined(published_at)
    && slug.current != $slug
    && (industry == $industry || count(tags[@ in $tags]) > 0)
  ] {
    ${IDEA_CARD_FIELDS},
    "_industryMatch": industry == $industry,
    "_tagMatch": count(tags[@ in $tags])
  } | order(_industryMatch desc, _tagMatch desc, featured desc, published_at desc)[0...4]
`

export const IDEA_SLUGS_QUERY = groq`
  *[_type == "businessIdea" && defined(slug.current)] {
    "slug": slug.current,
    "lastmod": coalesce(_updatedAt, _createdAt)
  }
`

export const CATEGORY_IDEAS_QUERY = groq`
  *[
    _type == "businessIdea"
    && defined(slug.current)
    && defined(published_at)
    && ($industry == "" || industry == $industry)
    && ($budget   == "" || budget_range == $budget)
    && ($difficulty == "" || difficulty_level == $difficulty)
  ] | order(featured desc, published_at desc)[0...24] {
    ${IDEA_CARD_FIELDS}
  }
`

export const SECTOR_HEROES_QUERY = groq`
  *[_type == "businessIdea" && defined(published_at)]
  | order(featured desc, _updatedAt desc) {
    industry,
    "cover": cover_image { asset->{ url }, alt }
  }
`

export const SECTOR_COUNTS_QUERY = groq`
  {
    "saas":          count(*[_type == "businessIdea" && industry == "SaaS"                     && defined(published_at)]),
    "ecommerce":     count(*[_type == "businessIdea" && industry == "E-commerce"               && defined(published_at)]),
    "localServices": count(*[_type == "businessIdea" && industry == "Local Services"           && defined(published_at)]),
    "health":        count(*[_type == "businessIdea" && industry == "Health & Wellness"        && defined(published_at)]),
    "edtech":        count(*[_type == "businessIdea" && industry == "EdTech"                   && defined(published_at)]),
    "aiml":          count(*[_type == "businessIdea" && industry == "AI / ML"                  && defined(published_at)]),
    "climate":       count(*[_type == "businessIdea" && industry == "Climate / Sustainability" && defined(published_at)]),
    "fintech":       count(*[_type == "businessIdea" && industry == "FinTech"                  && defined(published_at)])
  }
`

export const RELATED_IDEAS_QUERY = groq`
  *[
    _type == "businessIdea"
    && defined(slug.current)
    && slug.current != $slug
    && (industry == $industry || count(tags[@ in $tags]) > 0)
  ] | order(featured desc, published_at desc)[0...3] {
    ${IDEA_CARD_FIELDS}
  }
`

export const RELATED_IDEAS_FOR_POST_QUERY = groq`
  *[
    _type == "businessIdea"
    && defined(slug.current)
    && (count(tags[@ in $tags]) > 0)
  ] | order(featured desc, published_at desc)[0...3] {
    ${IDEA_CARD_FIELDS}
  }
`

export const RELATED_POSTS_FOR_IDEA_QUERY = groq`
  *[
    _type == "post"
    && defined(slug.current)
    && count(tags[@ in $tags]) > 0
  ] | order(published_at desc)[0...3] {
    ${POST_CARD_FIELDS}
  }
`

export const FEATURED_IDEAS_QUERY = groq`
  *[_type == "businessIdea" && featured == true && defined(published_at)]
  | order(published_at desc)[0...6] {
    ${IDEA_CARD_FIELDS}
  }
`

/** Count of ideas matching the same filters — for "Showing X ideas" display */
export const IDEAS_COUNT_QUERY = groq`
  count(*[
    _type == "businessIdea"
    && defined(slug.current)
    && defined(published_at)
    && ($industry   == "" || industry          == $industry)
    && ($budget     == "" || budget_range      == $budget)
    && ($saturation == "" || market_saturation == $saturation)
    && ($difficulty == "" || difficulty_level  == $difficulty)
    && (count($tags) == 0 || count(tags[@ in $tags]) > 0)
    && ($search     == "" || [title, description, industry, tags[]] match $search)
  ])
`

export const IDEA_TAGS_QUERY = groq`
  array::unique(*[_type == "businessIdea" && defined(tags)].tags[])
`

/** Paginated version — pass $from (0-based), $to (inclusive), and $sort */
export const IDEAS_PAGE_QUERY = groq`
  *[
    _type == "businessIdea"
    && defined(slug.current)
    && defined(published_at)
    && ($industry    == "" || industry           == $industry)
    && ($budget      == "" || budget_range       == $budget)
    && ($saturation  == "" || market_saturation  == $saturation)
    && ($difficulty  == "" || difficulty_level   == $difficulty)
    && (count($tags) == 0  || count(tags[@ in $tags]) > 0)
    && ($search      == "" || [title, description, industry, tags[]] match $search)
  ] | order(
    select($sort == "featured" => featured, false) desc,
    select($sort == "newest" => published_at, "") desc,
    select(
      $sort == "budget_asc" =>
        select(
          budget_range == "under_1l"  => 1,
          budget_range == "1l_10l"    => 2,
          budget_range == "10l_50l"   => 3,
          budget_range == "50l_2cr"   => 4,
          budget_range == "2cr_plus"  => 5,
          99
        ),
      99
    ) asc,
    select(
      $sort == "budget_desc" =>
        select(
          budget_range == "under_1l"  => 1,
          budget_range == "1l_10l"    => 2,
          budget_range == "10l_50l"   => 3,
          budget_range == "50l_2cr"   => 4,
          budget_range == "2cr_plus"  => 5,
          0
        ),
      0
    ) desc,
    select(
      $sort == "easiest" =>
        select(
          difficulty_level == "beginner"     => 1,
          difficulty_level == "intermediate" => 2,
          difficulty_level == "advanced"     => 3,
          difficulty_level == "expert"       => 4,
          99
        ),
      99
    ) asc,
    featured desc,
    published_at desc
  ) [$from..$to] {
    ${IDEA_CARD_FIELDS}
  }
`

// ─── Blog Posts ───────────────────────────────────────────────────────────────

export const POSTS_QUERY = groq`
  *[
    _type == "post"
    && defined(slug.current)
    && defined(published_at)
    && ($category == "" || category == $category)
    && (count($tags) == 0 || count(tags[@ in $tags]) > 0)
  ] | order(published_at desc) {
    ${POST_CARD_FIELDS}
  }
`

export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ${POST_CARD_FIELDS},
    _updatedAt,
    body,
    faqs,
    seo_title,
    seo_description
  }
`

export const POLICY_PULSE_SLUGS_QUERY = groq`
  *[_type == "post" && "policy-pulse" in tags && defined(slug.current)] {
    "slug": slug.current,
    "lastmod": coalesce(_updatedAt, _createdAt)
  }
`

export const POLICY_PULSE_QUERY = groq`
  *[_type == "post" && "policy-pulse" in tags && defined(published_at)]
  | order(published_at desc)[0...3] {
    ${POST_CARD_FIELDS}
  }
`

export const RELATED_POSTS_QUERY = groq`
  *[
    _type == "post"
    && defined(slug.current)
    && slug.current != $slug
    && category == $category
  ] | order(published_at desc)[0...3] {
    ${POST_CARD_FIELDS}
  }
`

export const POST_TAGS_QUERY = groq`
  array::unique(*[_type == "post" && defined(tags)].tags[])
`

export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current,
    "lastmod": coalesce(_updatedAt, _createdAt)
  }
`

/** Count of posts matching the same filters */
export const POSTS_COUNT_QUERY = groq`
  count(*[
    _type == "post"
    && defined(slug.current)
    && defined(published_at)
    && ($category == "" || category == $category)
    && (count($tags) == 0 || count(tags[@ in $tags]) > 0)
  ])
`

/** Paginated version — pass $from and $to */
export const POSTS_PAGE_QUERY = groq`
  *[
    _type == "post"
    && defined(slug.current)
    && defined(published_at)
    && ($category == "" || category == $category)
    && (count($tags) == 0 || count(tags[@ in $tags]) > 0)
  ] | order(published_at desc) [$from..$to] {
    ${POST_CARD_FIELDS}
  }
`

/** Authored blog posts only (excludes policy-pulse tag) */
export const AUTHORED_POSTS_PAGE_QUERY = groq`
  *[
    _type == "post"
    && defined(slug.current)
    && defined(published_at)
    && !("policy-pulse" in coalesce(tags, []))
    && ($category == "" || category == $category)
    && (count($tags) == 0 || count(tags[@ in $tags]) > 0)
  ] | order(
    select($sort == "featured" => featured, false) desc,
    select($sort == "newest"   => published_at, "") desc,
    select($sort == "oldest"   => published_at, "9999") asc,
    select($sort == "shortest" => coalesce(reading_time, 9999), 9999) asc,
    select($sort == "longest"  => coalesce(reading_time, 0),    0)    desc,
    featured desc,
    published_at desc
  ) [$from..$to] {
    ${POST_CARD_FIELDS}
  }
`

export const AUTHORED_POSTS_COUNT_QUERY = groq`
  count(*[
    _type == "post"
    && defined(slug.current)
    && defined(published_at)
    && !("policy-pulse" in coalesce(tags, []))
    && ($category == "" || category == $category)
    && (count($tags) == 0 || count(tags[@ in $tags]) > 0)
  ])
`

export const AUTHORED_POST_TAGS_QUERY = groq`
  array::unique(*[_type == "post" && defined(tags) && !("policy-pulse" in coalesce(tags, []))].tags[])
`

/** Policy Pulse posts only */
export const POLICY_PULSE_PAGE_QUERY = groq`
  *[
    _type == "post"
    && defined(slug.current)
    && defined(published_at)
    && "policy-pulse" in coalesce(tags, [])
  ] | order(published_at desc) [$from..$to] {
    ${POST_CARD_FIELDS}
  }
`

export const POLICY_PULSE_COUNT_QUERY = groq`
  count(*[
    _type == "post"
    && defined(slug.current)
    && defined(published_at)
    && "policy-pulse" in coalesce(tags, [])
  ])
`

export const RECENT_POSTS_QUERY = groq`
  *[_type == "post" && defined(published_at) && !("policy-pulse" in tags)]
  | order(published_at desc)[0...4] {
    ${POST_CARD_FIELDS}
  }
`

export const ALL_POSTS_FOR_LINKING_QUERY = groq`
  *[_type == "post" && defined(slug.current) && defined(title)] {
    "slug": slug.current,
    title,
    tags
  }
`

// ─── Global Search Index ──────────────────────────────────────────────────────

export const SEARCH_IDEAS_INDEX_QUERY = groq`
  *[_type == "businessIdea" && defined(slug.current) && defined(published_at)] {
    "slug": slug.current,
    title,
    industry,
    tags,
    budget_range,
    difficulty_level,
    featured,
    "cover": cover_image.asset->url
  }
`

export const SEARCH_POSTS_INDEX_QUERY = groq`
  *[_type == "post" && defined(slug.current) && defined(published_at)] {
    "slug": slug.current,
    title,
    category,
    tags,
    featured,
    "cover": cover_image.asset->url
  }
`

export const SEARCH_DEEP_QUERY = groq`
  {
    "ideas": *[
      _type == "businessIdea"
      && defined(slug.current)
      && defined(published_at)
      && [title, description, industry, tags[]] match $q
    ] | order(featured desc, published_at desc)[0...8] {
      "slug": slug.current,
      title,
      industry,
      tags,
      "cover": cover_image.asset->url
    },
    "posts": *[
      _type == "post"
      && defined(slug.current)
      && defined(published_at)
      && [title, excerpt, category, tags[]] match $q
    ] | order(featured desc, published_at desc)[0...6] {
      "slug": slug.current,
      title,
      category,
      tags,
      "cover": cover_image.asset->url
    }
  }
`
