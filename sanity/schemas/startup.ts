import { defineField, defineType } from 'sanity'

/**
 * startup — Indian startup profile document.
 *
 * Tier 1 of the ingestion model: hand-curated by editors in the Studio.
 * Tier 2/3 (scrapers, news LLM extraction) write to the SAME schema via the
 * Sanity HTTP API so curated and scraped data live side-by-side and editors
 * can override anything that comes in wrong.
 *
 * Enum values intentionally mirror lib/sanity/types.ts where possible
 * (industry list reuses businessIdea.industry; STAGE_LABELS already exists).
 */
export default defineType({
  name: 'startup',
  title: 'Startup',
  type: 'document',
  fields: [
    // ── Identity ────────────────────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Brand Name',
      description: 'Public-facing name (e.g. "Zomato", "CRED").',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: 'legal_name',
      title: 'Legal Entity Name',
      description: 'As filed with MCA (e.g. "Zomato Limited").',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cin',
      title: 'CIN (Corporate Identification Number)',
      description: '21-char MCA CIN. Primary key for scraper joins.',
      type: 'string',
      validation: (Rule) =>
        Rule.regex(/^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/, {
          name: 'CIN',
          invert: false,
        }).warning('CIN should match the standard 21-character MCA format.'),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alt Text' })],
    }),
    defineField({
      name: 'cover_image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alt Text' })],
    }),
    defineField({ name: 'website',  title: 'Website URL', type: 'url' }),
    defineField({ name: 'founded_year', title: 'Founded Year', type: 'number', validation: (Rule) => Rule.min(1900).max(new Date().getFullYear()) }),
    defineField({ name: 'hq_city',  title: 'HQ City',  type: 'string' }),
    defineField({ name: 'hq_state', title: 'HQ State', type: 'string' }),
    defineField({ name: 'country', title: 'Country', type: 'string', initialValue: 'India' }),

    // ── Classification ──────────────────────────────────────────────────────
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
      options: {
        // Mirror businessIdea.industry so /startups and /business-ideas use the same taxonomy
        list: [
          'SaaS', 'E-commerce', 'Health & Wellness', 'EdTech', 'FinTech',
          'Creator Economy', 'Local Services', 'Climate / Sustainability',
          'AI / ML', 'AgriTech & Food', 'Manufacturing', 'Travel & Hospitality',
          'B2B Services', 'Real Estate & PropTech', 'Pet & Animal Care',
          'Logistics & Supply Chain', 'Export & Trade', 'Other',
        ],
      },
    }),
    defineField({
      name: 'sub_industry',
      title: 'Sub-industry / Vertical',
      description: 'Free text — e.g. "Insurtech", "D2C beauty", "K-12 tutoring"',
      type: 'string',
    }),
    defineField({
      name: 'business_model',
      title: 'Business Model',
      type: 'string',
      options: {
        list: [
          { title: 'B2B SaaS',          value: 'b2b_saas' },
          { title: 'B2C Subscription',  value: 'b2c_subscription' },
          { title: 'D2C Brand',         value: 'd2c' },
          { title: 'Marketplace',       value: 'marketplace' },
          { title: 'E-commerce',        value: 'ecommerce' },
          { title: 'Fintech (Lending)', value: 'fintech_lending' },
          { title: 'Fintech (Payments)',value: 'fintech_payments' },
          { title: 'Aggregator',        value: 'aggregator' },
          { title: 'Service / Agency',  value: 'service' },
          { title: 'Hardware / IoT',    value: 'hardware' },
          { title: 'Media / Content',   value: 'media' },
          { title: 'Other',             value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'stage',
      title: 'Funding Stage',
      type: 'string',
      options: {
        list: [
          { title: 'Bootstrapped', value: 'bootstrapped' },
          { title: 'Pre-seed',     value: 'pre_seed' },
          { title: 'Seed',         value: 'seed' },
          { title: 'Series A',     value: 'series_a' },
          { title: 'Series B',     value: 'series_b' },
          { title: 'Series C',     value: 'series_c' },
          { title: 'Series D+',    value: 'series_d_plus' },
          { title: 'Unicorn',      value: 'unicorn' },
          { title: 'IPO',          value: 'ipo' },
          { title: 'Listed',       value: 'listed' },
        ],
      },
    }),
    defineField({
      name: 'status',
      title: 'Operating Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active',    value: 'active' },
          { title: 'Acquired',  value: 'acquired' },
          { title: 'Shut Down', value: 'shut_down' },
          { title: 'Stealth',   value: 'stealth' },
        ],
      },
      initialValue: 'active',
    }),

    // ── People ──────────────────────────────────────────────────────────────
    defineField({
      name: 'founders',
      title: 'Founders',
      description: 'References to startupFounder docs, in the order they appear on the profile.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'startupFounder' }] }],
    }),
    defineField({
      name: 'key_executives',
      title: 'Key Executives',
      description: 'CEO, CFO, CTO etc. that are NOT founders.',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name',  title: 'Name',  type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'title', title: 'Title', type: 'string' }),
          defineField({ name: 'linkedin_url', title: 'LinkedIn', type: 'url' }),
        ],
        preview: { select: { title: 'name', subtitle: 'title' } },
      }],
    }),
    defineField({
      name: 'board',
      title: 'Board Members / Directors',
      description: 'From MCA filings if available; otherwise editorial.',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'role', title: 'Role', type: 'string' }),
          defineField({ name: 'din',  title: 'DIN (Director ID)', type: 'string' }),
        ],
        preview: { select: { title: 'name', subtitle: 'role' } },
      }],
    }),

    // ── Story ───────────────────────────────────────────────────────────────
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description: 'One-line value prop. e.g. "India\'s largest food delivery platform".',
      type: 'string',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'short_description',
      title: 'Short Description',
      description: 'Card / meta description. 2–3 sentences.',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(400),
    }),
    defineField({
      name: 'long_story',
      title: 'Long Story',
      description: 'The full narrative — founding, pivots, scaling, today. Rich text.',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true }, fields: [
          defineField({ name: 'alt', type: 'string', title: 'Alt Text' }),
          defineField({ name: 'caption', type: 'string', title: 'Caption' }),
        ] },
      ],
    }),
    defineField({
      name: 'milestones',
      title: 'Timeline / Milestones',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'date',  title: 'Date',  type: 'date' }),
          defineField({ name: 'title', title: 'Headline', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
          defineField({ name: 'source_url', title: 'Source URL', type: 'url' }),
        ],
        preview: { select: { title: 'title', subtitle: 'date' } },
      }],
    }),

    // ── Financials (historical snapshots) ───────────────────────────────────
    defineField({
      name: 'financials',
      title: 'Financial Snapshots',
      description: 'Year-by-year, MCA AOC-4 numbers. All amounts in INR.',
      type: 'array',
      of: [{
        type: 'object',
        name: 'financialSnapshot',
        fields: [
          defineField({ name: 'fiscal_year',  title: 'Fiscal Year',  type: 'string', description: 'e.g. "FY24" or "2023-24"', validation: (Rule) => Rule.required() }),
          defineField({ name: 'revenue',      title: 'Revenue (₹)', type: 'number' }),
          defineField({ name: 'profit',       title: 'Profit / (Loss) (₹)', type: 'number' }),
          defineField({ name: 'ebitda',       title: 'EBITDA (₹)', type: 'number' }),
          defineField({ name: 'burn_monthly', title: 'Monthly Burn (₹)', type: 'number' }),
          defineField({ name: 'employee_count', title: 'Employee Count', type: 'number' }),
          defineField({ name: 'valuation',    title: 'Valuation at FY end (₹)', type: 'number' }),
          defineField({ name: 'currency',     title: 'Currency', type: 'string', initialValue: 'INR' }),
          defineField({ name: 'source',       title: 'Source',   type: 'string', description: 'e.g. "MCA AOC-4", "Tofler", "Self-reported"' }),
          defineField({ name: 'source_url',   title: 'Source URL', type: 'url' }),
        ],
        preview: {
          select: { title: 'fiscal_year', subtitle: 'revenue' },
          prepare({ title, subtitle }) {
            return { title, subtitle: subtitle ? `Rev ₹${subtitle.toLocaleString('en-IN')}` : '—' }
          },
        },
      }],
    }),

    // ── Funding ─────────────────────────────────────────────────────────────
    defineField({
      name: 'total_funding_raised',
      title: 'Total Funding Raised (₹)',
      type: 'number',
    }),
    defineField({
      name: 'latest_valuation',
      title: 'Latest Known Valuation (₹)',
      type: 'number',
    }),
    defineField({
      name: 'funding_rounds',
      title: 'Funding Rounds',
      type: 'array',
      of: [{
        type: 'object',
        name: 'fundingRound',
        fields: [
          defineField({ name: 'date',         title: 'Round Date',       type: 'date', validation: (Rule) => Rule.required() }),
          defineField({ name: 'round_type',   title: 'Round Type',       type: 'string',
            options: { list: ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Series E+', 'Bridge', 'Debt', 'Grant', 'IPO', 'Other'] } }),
          defineField({ name: 'amount',       title: 'Amount Raised (₹)', type: 'number' }),
          defineField({ name: 'amount_usd',   title: 'Amount (USD)',     type: 'number' }),
          defineField({ name: 'lead_investor',title: 'Lead Investor',    type: 'string' }),
          defineField({ name: 'all_investors', title: 'All Investors',   type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
          defineField({ name: 'valuation_at_round', title: 'Post-money Valuation (₹)', type: 'number' }),
          defineField({ name: 'source_url',   title: 'Source URL',       type: 'url' }),
        ],
        preview: {
          select: { title: 'round_type', subtitle: 'date', amount: 'amount' },
          prepare({ title, subtitle, amount }) {
            return { title: title ?? 'Round', subtitle: `${subtitle ?? ''} · ₹${(amount ?? 0).toLocaleString('en-IN')}` }
          },
        },
      }],
    }),

    // ── Tags & relationships ────────────────────────────────────────────────
    defineField({
      name: 'tags',
      title: 'Tags / Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'competitors',
      title: 'Competitors',
      description: 'Other startups in the database. Reciprocal links are built at query time.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'startup' }] }],
    }),
    defineField({
      name: 'related_ideas',
      title: 'Related Business Ideas',
      description: 'Cross-link to existing /business-ideas docs covering the same space.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'businessIdea' }] }],
    }),
    defineField({
      name: 'parent_company',
      title: 'Parent Company',
      description: 'If this startup was acquired, link to the parent (if also in the DB).',
      type: 'reference',
      to: [{ type: 'startup' }],
    }),

    // ── SEO ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'seo_title',
      title: 'SEO Title',
      type: 'string',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'seo_description',
      title: 'SEO Meta Description',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'og_image',
      title: 'OG Image (override)',
      type: 'image',
    }),

    // ── Provenance ──────────────────────────────────────────────────────────
    defineField({
      name: 'data_sources',
      title: 'Data Sources',
      description: 'Audit trail. Scrapers append to this on each refresh.',
      type: 'array',
      of: [{
        type: 'object',
        name: 'dataSource',
        fields: [
          defineField({ name: 'source',       title: 'Source',       type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'url',          title: 'URL',          type: 'url' }),
          defineField({ name: 'last_fetched', title: 'Last Fetched', type: 'datetime' }),
        ],
        preview: { select: { title: 'source', subtitle: 'last_fetched' } },
      }],
    }),
    defineField({
      name: 'verified',
      title: 'Editorially Verified',
      type: 'boolean',
      description: 'True only when a human editor has reviewed everything on this profile.',
      initialValue: false,
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'last_updated_at',
      title: 'Last Updated',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'published_at',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'industry',
      media: 'logo',
    },
    prepare({ title, subtitle, media }) {
      return { title: title ?? 'Untitled startup', subtitle: subtitle ?? '—', media }
    },
  },
  orderings: [
    { title: 'Newest First',        name: 'publishedAtDesc',     by: [{ field: 'published_at', direction: 'desc' }] },
    { title: 'Recently Updated',    name: 'lastUpdatedAtDesc',   by: [{ field: 'last_updated_at', direction: 'desc' }] },
    { title: 'Highest Funding',     name: 'fundingDesc',         by: [{ field: 'total_funding_raised', direction: 'desc' }] },
  ],
})
