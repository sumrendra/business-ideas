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
    seo_title,
    seo_description
  }
`

export const IDEA_SLUGS_QUERY = groq`
  *[_type == "businessIdea" && defined(slug.current)] { "slug": slug.current }
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
    body,
    seo_title,
    seo_description
  }
`

export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)] { "slug": slug.current }
`

export const RECENT_POSTS_QUERY = groq`
  *[_type == "post" && defined(published_at)]
  | order(published_at desc)[0...4] {
    ${POST_CARD_FIELDS}
  }
`
