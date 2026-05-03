# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server at localhost:3000
npm run build      # production build (Next.js standalone output)
npm run start      # serve the production build
npm run lint       # ESLint via next lint
```

No test suite is configured — there is no `test` script.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Public — baked into the Docker image at build time |
| `NEXT_PUBLIC_SANITY_DATASET` | Defaults to `production` |
| `SANITY_API_TOKEN` | Server-only; injected at runtime via Cloud Run secrets |
| `SANITY_WEBHOOK_SECRET` | Server-only; validates the revalidation webhook |

`NEXT_PUBLIC_*` vars must be available at **build time** (set as Docker `--build-arg`). The two server-only vars are injected at **runtime** and must never be baked into the image.

## Architecture

This is a **Next.js 15 App Router** site backed by **Sanity v3** as a headless CMS. All content fetching is server-side; there is no client-side data fetching.

### Data flow

1. Content is authored in the embedded Sanity Studio at `/studio` (served by `app/studio/[[...tool]]/page.tsx` via `next-sanity`).
2. Pages fetch from Sanity using GROQ queries in `lib/sanity/queries.ts` via the client in `lib/sanity/client.ts`.
3. Pages are statically generated at build time (`generateStaticParams`) with ISR tags (`next: { tags: [...] }`).
4. When content is published in Sanity, a webhook hits `POST /api/revalidate?secret=<SANITY_WEBHOOK_SECRET>` with `{ _type, slug }`. The handler calls `revalidateTag` and `revalidatePath` to purge only the affected pages.

### Key files

- `lib/sanity/queries.ts` — all GROQ queries; shared projection fragments (`IDEA_CARD_FIELDS`, `POST_CARD_FIELDS`) keep card vs. detail field sets consistent.
- `lib/sanity/types.ts` — TypeScript interfaces for `Idea` and `Post`, plus all enum label maps (`BUDGET_LABELS`, `STAGE_LABELS`, etc.) and filter option arrays used across the UI.
- `sanity/schemas/businessIdea.ts` / `sanity/schemas/post.ts` — Sanity document schemas; the enum values here must match the string literals in `types.ts`.
- `app/api/revalidate/route.ts` — ISR webhook handler; validates secret, reads `_type` and `slug` from body, fires targeted revalidation.

### Filtering

The `/ideas` page uses URL search params (`industry`, `budget`, `stage`, `difficulty`, `tags`) as the sole filter state — no client state. `FilterSidebar` is a client component that reads/writes these params via `useRouter`/`useSearchParams`. The GROQ `IDEAS_QUERY` accepts all params and treats an empty string as "no filter".

### Sanity image URLs

Images from Sanity are transformed through `lib/sanity/image.ts` (wraps `@sanity/image-url`). Use `urlFor(image).width(w).height(h).url()` — never construct `cdn.sanity.io` URLs manually.

### Deployment

Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`) which:
1. Builds a Docker image with `NEXT_PUBLIC_*` build args injected from GitHub secrets.
2. Pushes to Google Artifact Registry.
3. Deploys to **Google Cloud Run** with `SANITY_API_TOKEN` and `SANITY_WEBHOOK_SECRET` injected from Cloud Run secrets (not image env vars).

The Next.js build uses `output: 'standalone'` — the Docker runner stage copies `.next/standalone` and `.next/static` only; `public/` is also copied separately.
