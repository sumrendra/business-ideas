import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'feedback',
  title: 'User Feedback',
  type: 'document',
  fields: [
    defineField({ name: 'ideaSlug',  title: 'Idea Slug',  type: 'string' }),
    defineField({ name: 'ideaTitle', title: 'Idea Title', type: 'string' }),
    defineField({
      name: 'feedbackType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Wrong / outdated data',      value: 'wrong_data' },
          { title: 'Missing information',        value: 'missing_info' },
          { title: 'Suggest improvement',        value: 'suggestion' },
          { title: 'Other',                      value: 'other' },
        ],
      },
    }),
    defineField({ name: 'message', title: 'Message', type: 'text' }),
    defineField({ name: 'email',   title: 'Email (optional)', type: 'string' }),
    defineField({ name: 'submittedAt', title: 'Submitted At', type: 'datetime', readOnly: true }),
  ],
  preview: {
    select: { title: 'ideaTitle', subtitle: 'feedbackType', description: 'message' },
    prepare({ title, subtitle, description }) {
      return { title: title ?? 'Feedback', subtitle: `${subtitle ?? ''} — ${(description ?? '').slice(0, 60)}` }
    },
  },
})
