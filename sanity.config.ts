import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemas } from './sanity/schemas'

export default defineConfig({
  name: 'default',
  title: 'Business Ideas CMS',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Business Ideas')
              .schemaType('businessIdea')
              .child(S.documentTypeList('businessIdea').title('Business Ideas')),
            S.listItem()
              .title('Blog Posts')
              .schemaType('post')
              .child(S.documentTypeList('post').title('Blog Posts')),
            S.listItem()
              .title('User Feedback')
              .schemaType('feedback')
              .child(S.documentTypeList('feedback').title('User Feedback')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemas,
  },
})
