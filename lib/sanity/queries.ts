import { groq } from 'next-sanity'

// ─── Shared projection fragments ─────────────────────────────────────────────

const IDEA_CARD_FIELDS = groq`
  _id,
  title,
  "slug": slug.current,
  description,
  budget_range,
  industry,
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

/**
 * All published ideas, filtered by optional metadata params.
 * All params default to "" (empty string) which means "no filter applied".
 */
export const IDEAS_QUERY = groq`
  *[
    _type == "businessIdea"
    && defined(slug.current)
    && defined(published_at)
    && ($industry    == "" || industry        == $industry)
    && ($budget      == "" || budget_range    == $budget)
    && ($stage       == "" || stage           == $stage)
    && ($difficulty  == "" || difficulty_level == $difficulty)
    && (count($tags) == 0  || count(tags[@ in $tags]) > 0)
  ] | order(featured desc, published_at desc) {
    ${IDEA_CARD_FIELDS}
  }
`

/** Single idea by slug — full detail */
export const IDEA_BY_SLUG_QUERY = groq`
  *[_type == "businessIdea" && slug.current == $slug][0] {
    ${IDEA_CARD_FIELDS},
    problem,
    solution,
    resources_needed,
    seo_title,
    seo_description
  }
`

/** All idea slugs — for generateStaticParams */
export const IDEA_SLUGS_QUERY = groq`
  *[_type == "businessIdea" && defined(slug.current)] { "slug": slug.current }
`

/** Featured ideas for homepage */
export const FEATURED_IDEAS_QUERY = groq`
  *[_type == "businessIdea" && featured == true && defined(published_at)]
  | order(published_at desc)[0...6] {
    ${IDEA_CARD_FIELDS}
  }
`

/** All unique tags across all ideas — used to populate the filter sidebar */
export const IDEA_TAGS_QUERY = groq`
  array::unique(*[_type == "businessIdea" && defined(tags)].tags[])
`

// ─── Blog Posts ───────────────────────────────────────────────────────────────

/** All published blog posts, optionally filtered by category or tag */
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

/** Single post by slug — full detail */
export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ${POST_CARD_FIELDS},
    body,
    seo_title,
    seo_description
  }
`

/** All post slugs — for generateStaticParams */
export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)] { "slug": slug.current }
`

/** Recent posts for homepage */
export const RECENT_POSTS_QUERY = groq`
  *[_type == "post" && defined(published_at)]
  | order(published_at desc)[0...3] {
    ${POST_CARD_FIELDS}
  }
`
