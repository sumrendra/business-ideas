import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  perspective: 'published',
})

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// Server-side read client with a token. Identical to `client` except it is
// authenticated, so it can read document types that the dataset's public
// access filter does not expose anonymously (currently `startup` and
// `startupFounder`). Used ONLY by the startup/founder pages — every existing
// idea/blog/sector page keeps using the public CDN `client` above untouched.
// The token is server-only (never shipped to the browser) and `useCdn: false`
// guarantees the authenticated request is not served from the anonymous CDN
// cache. Falls back to the anonymous CDN client when no token is configured
// (e.g. local dev without secrets) so builds never crash.
export const readClient = process.env.SANITY_API_TOKEN
  ? createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      useCdn: false,
      perspective: 'published',
      token: process.env.SANITY_API_TOKEN,
    })
  : client
