import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'businessIdea',
  title: 'Business Idea',
  type: 'document',
  fields: [
    // ── Core ────────────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(10).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cover_image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      description: 'One or two sentences shown on cards and in meta description.',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(300),
    }),

    // ── Filters ─────────────────────────────────────────────────────────────
    defineField({
      name: 'budget_range',
      title: 'Budget Range',
      type: 'string',
      options: {
        list: [
          { title: 'Under ₹1 Lakh',        value: 'under_1l' },
          { title: '₹1 Lakh – ₹10 Lakh',   value: '1l_10l' },
          { title: '₹10 Lakh – ₹50 Lakh',  value: '10l_50l' },
          { title: '₹50 Lakh – ₹2 Crore',  value: '50l_2cr' },
          { title: '₹2 Crore+',            value: '2cr_plus' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'industry',
      title: 'Industry / Category',
      type: 'string',
      options: {
        list: [
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
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'market_saturation',
      title: 'Market Saturation',
      description: 'How competitive / proven is this market right now?',
      type: 'string',
      options: {
        list: [
          { title: 'Concept Stage',   value: 'concept' },
          { title: 'Validated',       value: 'validated' },
          { title: 'Competitive',     value: 'competitive' },
          { title: 'Proven Market',   value: 'proven' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'difficulty_level',
      title: 'Complexity to Establish',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner',     value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced',     value: 'advanced' },
          { title: 'Expert',       value: 'expert' },
        ],
        layout: 'radio',
      },
    }),

    // ── Rich Content Sections ────────────────────────────────────────────────
    defineField({
      name: 'introduction',
      title: 'Introduction',
      description: 'What is this business? Set the scene in 2–4 paragraphs.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'target_audience',
      title: 'Who Is It For?',
      description: 'Describe the ideal founder profile and target customer.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'why_it_works',
      title: 'What Works in This & Why?',
      description: 'Core reasons why this business model is viable.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'scope_in_india',
      title: 'Scope in India',
      description: 'Market size, relevant geographies, and growth potential in India.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'things_to_note',
      title: 'Things to Be Mindful Of',
      description: 'Key risks, gotchas and operational considerations. Add one per line.',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'current_landscape',
      title: 'Current Landscape in India',
      description: 'Who are the existing players? What does the competitive map look like?',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    // ── Business Key Metrics ─────────────────────────────────────────────────
    defineField({
      name: 'gross_margin',
      title: 'Gross Margin',
      description: 'e.g. "55–70%" or "20–30% on installation; 60–70% on AMC"',
      type: 'string',
    }),
    defineField({
      name: 'setup_cost_range',
      title: 'Setup Cost',
      description: 'e.g. "₹20,000–₹60,000"',
      type: 'string',
    }),
    defineField({
      name: 'pivot_options',
      title: 'Pivot Options',
      description: 'Adjacent pivots and expansion paths if the primary model needs adjusting.',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'financing_options',
      title: 'Financing Options',
      description: 'How can a founder fund this? e.g. bootstrapped, angel, MUDRA loan.',
      type: 'text',
      rows: 2,
    }),

    // ── Pros & Cons ──────────────────────────────────────────────────────────
    defineField({
      name: 'pros',
      title: 'Pros',
      description: 'Key advantages of this business. One item per entry.',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'cons',
      title: 'Cons',
      description: 'Key challenges or risks. One item per entry.',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    // ── Legacy Rich Content (kept for backward compat) ───────────────────────
    defineField({
      name: 'problem',
      title: 'Problem Being Solved (legacy)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'solution',
      title: 'Proposed Solution (legacy)',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    // ── Meta & Taxonomy ──────────────────────────────────────────────────────
    defineField({
      name: 'stage',
      title: 'Idea Stage',
      type: 'string',
      options: {
        list: [
          { title: 'Raw Concept',     value: 'concept' },
          { title: 'Validated',       value: 'validated' },
          { title: 'Has Competitors', value: 'competitive' },
          { title: 'MVP Possible',    value: 'mvp_ready' },
          { title: 'Proven Market',   value: 'proven' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'revenue_model',
      title: 'Revenue Model',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'Subscription (SaaS)',
          'One-time Sale',
          'Marketplace %',
          'Advertising',
          'Freemium',
          'Consulting / Services',
          'Licensing',
          'Affiliate',
        ],
      },
    }),
    defineField({
      name: 'resources_needed',
      title: 'Resources Needed',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'Solo Founder OK',
          'Technical Co-founder',
          'Designer',
          'Domain Expertise',
          'Regulatory Approval',
          'Physical Space',
          'Hardware / Manufacturing',
          'Large Capital',
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags / Keywords',
      description: 'Add SEO keywords and topic tags. Users can filter by these.',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
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
      name: 'proof_points',
      title: 'Proof Points',
      description: 'Real case studies and data sources that validate this idea.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'proof_point',
          fields: [
            defineField({ name: 'type', title: 'Type', type: 'string', options: { list: ['Case Study', 'Market Data', 'Government Source'], layout: 'radio' }, validation: (Rule) => Rule.required() }),
            defineField({ name: 'source', title: 'Source Name', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
            defineField({ name: 'headline', title: 'Headline / Stat', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'founder', title: 'Founder / Author', type: 'string' }),
            defineField({ name: 'key_stat', title: 'Key Number / Milestone', type: 'string' }),
            defineField({ name: 'quote', title: 'Pull Quote', type: 'text', rows: 2 }),
          ],
          preview: {
            select: { title: 'headline', subtitle: 'source' },
          },
        },
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
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
      title: 'title',
      subtitle: 'industry',
      media: 'cover_image',
    },
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'publishedAtDesc',
      by: [{ field: 'published_at', direction: 'desc' }],
    },
  ],
})
