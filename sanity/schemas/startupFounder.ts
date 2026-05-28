import { defineField, defineType } from 'sanity'

/**
 * startupFounder — separate document so a founder can be referenced by
 * multiple startup documents (serial founders, co-founders across cos, etc.)
 * and so we can build a /founders/[slug] surface later.
 */
export default defineType({
  name: 'startupFounder',
  title: 'Startup Founder',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alt Text' })],
    }),
    defineField({
      name: 'short_bio',
      title: 'Short Bio',
      description: 'One or two sentences shown on cards.',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(400),
    }),
    defineField({
      name: 'long_bio',
      title: 'Long Bio',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({ name: 'linkedin_url',  title: 'LinkedIn URL',  type: 'url' }),
    defineField({ name: 'twitter_handle', title: 'Twitter / X Handle', type: 'string' }),
    defineField({ name: 'personal_site',  title: 'Personal Website', type: 'url' }),
    defineField({
      name: 'background',
      title: 'Background Tags',
      description: 'e.g. IIT, IIM, ex-Flipkart, second-time founder',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'hometown',
      title: 'Hometown / Origin City',
      type: 'string',
    }),
    defineField({
      name: 'data_sources',
      title: 'Data Sources',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'source', title: 'Source', type: 'string' }),
          defineField({ name: 'url',    title: 'URL',    type: 'url' }),
          defineField({ name: 'last_fetched', title: 'Last Fetched', type: 'datetime' }),
        ],
        preview: { select: { title: 'source', subtitle: 'url' } },
      }],
    }),
    defineField({
      name: 'verified',
      title: 'Verified',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'last_updated_at',
      title: 'Last Updated',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'hometown', media: 'photo' },
  },
})
