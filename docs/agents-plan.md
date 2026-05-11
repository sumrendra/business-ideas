# AI Agents — Implementation Plan & Progress Tracker

> Long-term tracker for building AI agents on top of business-ideas.
> Update the **Status** column as work progresses. Add a `Notes` line under any task that hit friction.
> Detailed cost breakdown lives in [agents-pricing.md](agents-pricing.md).

---

## Architecture (locked-in decisions)

| Decision | Choice |
|---|---|
| **Runtime — real-time** | Next.js API routes (chat only) |
| **Runtime — background** | Cloud Run **Jobs** (shared `agents-worker` service) |
| **LLM — writing/research** | Anthropic Claude via **Vertex AI** |
| **LLM — bulk extraction** | Google **Gemini Flash** |
| **LLM — free chat (guided)** | Google **Gemini Flash** with RAG |
| **LLM — paid chat (full agent)** | Claude Sonnet 4.6 + tools |
| **Vector store** | **pgvector** on existing Postgres (no new DB) |
| **Orchestration framework** | None. Anthropic SDK + handwritten loops. Revisit at 4+ agents. |
| **Triggering** | Cloud Tasks (on-demand) + Cloud Scheduler (cron) |
| **Storage targets** | Sanity (drafts), Postgres (tenders, embeddings, conversations), GCS (raw artifacts) |
| **Observability** | Cloud Logging day 1; Langfuse self-hosted later |
| **Cost guardrails** | Per-agent GCP billing labels, hard `max_tokens`, prompt caching always on, rate limit per session |

---

## Target architecture

```
Next.js (Cloud Run Service)
  └── /api/chat                 ──► tier check
        ├── free  → Gemini Flash + pgvector RAG (one turn, max_tokens 250)
        └── paid  → Claude Sonnet + tools (multi-turn, streaming)

Cloud Scheduler / Cloud Tasks
  └── enqueues jobs ──► agents-worker (Cloud Run Jobs)
                          ├── idea-writer        (Claude)
                          ├── blog-writer        (Claude)
                          ├── scraper            (Playwright + Gemini Flash)
                          ├── researcher         (Claude + web search)
                          └── embedder           (Gemini text-embedding,
                                                  triggered by Sanity webhook)
                                  │
                                  ├──► Sanity (drafts)
                                  ├──► Postgres (tenders, embeddings, chat logs)
                                  └──► GCS (raw HTML/PDFs)
```

---

## Phase 0 — Foundations  (Status: ⬜ Not started)

Goal: GCP wiring + empty worker repo that can deploy and call an LLM. Vector store ready.

| # | Task | Status | Notes |
|---|---|---|---|
| 0.1 | Enable Vertex AI API in GCP project | ⬜ | |
| 0.2 | Request quota for Claude on Vertex (region: `us-east5`) + Gemini on Vertex | ⬜ | |
| 0.3 | Create service account `agents-worker-sa` with roles: Vertex AI User, Secret Manager Accessor, Storage Object Admin (scoped bucket), Cloud SQL Client | ⬜ | |
| 0.4 | Provision GCS bucket `bi-agents-raw` (region same as Cloud Run) | ⬜ | |
| 0.5 | Enable `pgvector` extension on existing Postgres; create `embeddings` table (id, source_type, source_id, chunk_text, embedding vector(768), updated_at) | ⬜ | 768-dim for Gemini `text-embedding-004` |
| 0.6 | Scaffold `agents-worker/` package (Node 20, TS, Dockerfile, ESLint) | ⬜ | Mirror Next.js app's TS/lint config |
| 0.7 | Shared utilities: `llm/anthropic.ts`, `llm/gemini.ts`, `llm/embeddings.ts`, `shared/sanity.ts`, `shared/gcs.ts`, `shared/pg.ts` | ⬜ | Reuse `@sanity/client` pattern from `scripts/` |
| 0.8 | Deploy empty worker to Cloud Run Jobs via GitHub Actions | ⬜ | Mirror existing `.github/workflows/deploy.yml` |
| 0.9 | Smoke test: job runs, prints "hello", calls Claude on Vertex with a 1-token prompt, exits 0 | ⬜ | |
| 0.10 | Billing labels applied to worker (`agent=*`, `env=prod`) | ⬜ | |
| 0.11 | GCP budget alerts at $50 / $200 / $500 thresholds | ⬜ | |

**Exit criteria:** A Cloud Run Job invocation can call Claude on Vertex and exit cleanly. pgvector reachable. ~3–4 days.

---

## Phase 1 — Idea Writer  (Status: ⬜ Not started)

Goal: First real agent. Generates a draft `businessIdea` document in Sanity matching the schema.

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | Build TypeScript types for `businessIdea` (extend existing [lib/sanity/types.ts](../lib/sanity/types.ts)) usable by the agent | ⬜ | |
| 1.2 | Author prompt with full schema spec (use tool-call structured output) | ⬜ | One-shot or outline → fill, decide after eval |
| 1.3 | Implement `agents/idea-writer.ts` — input: topic + industry; output: validated draft object | ⬜ | |
| 1.4 | Add Sanity write path: create document with `_id: drafts.<uuid>` so it lands as draft in Studio | ⬜ | |
| 1.5 | HTTP entrypoint at `runners/http.ts` for Cloud Tasks; CLI entrypoint for local runs | ⬜ | |
| 1.6 | Manual eval: generate 5 ideas across industries, score 1–5 on quality, log cost per run | ⬜ | |
| 1.7 | Tune prompt / examples until median score ≥ 4 | ⬜ | |
| 1.8 | Document trigger format (sample Cloud Tasks payload) | ⬜ | |

**Exit criteria:** Trigger a job, see a usable draft `businessIdea` in Sanity Studio. Cost per draft logged. ~1 week.

---

## Phase 2 — Blog Writer  (Status: ⬜ Not started)

Goal: Generates a draft `post` in Sanity. Reuses idea-writer plumbing.

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | Build TS types for `post` Portable Text body + FAQs | ⬜ | |
| 2.2 | Author prompt with style guide + linked-idea context | ⬜ | |
| 2.3 | Implement `agents/blog-writer.ts` — input: topic + optional `linkedIdeaSlug` | ⬜ | |
| 2.4 | Fetch linked idea via existing GROQ `IDEA_BY_SLUG_QUERY` to ground the post | ⬜ | |
| 2.5 | Write draft post to Sanity with `_id: drafts.<uuid>` | ⬜ | |
| 2.6 | Manual eval: 5 posts, score 1–5, log cost | ⬜ | |

**Exit criteria:** Draft blog post created in Sanity, internally linked to an idea. ~3 days after Phase 1.

---

## Phase 3 — Scraper Agent  (Status: ⬜ Not started)

Goal: Wrap existing Playwright/Firecrawl scraping with LLM extraction. Runs in same worker. **Not a separate service.**

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | Port existing scraping scripts from [scripts/](../scripts/) into `agents-worker/agents/scraper/` | ⬜ | Keep Playwright wiring intact |
| 3.2 | Add GCS raw-snapshot writes: `gs://bi-agents-raw/<source>/<yyyy-mm-dd>/<id>.html` | ⬜ | Immutable raw layer |
| 3.3 | Implement Gemini Flash extraction step over each raw snapshot | ⬜ | Cheaper than Claude for this |
| 3.4 | Write structured rows to Postgres `tenders` table (existing schema) | ⬜ | |
| 3.5 | Cloud Scheduler cron entries per source (daily/hourly as appropriate) | ⬜ | |
| 3.6 | Retry policy + dead-letter logging for sites that block | ⬜ | |
| 3.7 | Per-source rate limiting (only if needed — defer if not) | ⬜ | |

**Exit criteria:** Scheduled scrape runs end-to-end nightly; raw in GCS, structured in Postgres. ~1 week.

---

## Phase 4 — Researcher  (Status: ⬜ Not started)

Goal: Multi-step agent: web search → read sources → synthesize → output draft idea or blog.

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | Pick a web search tool (Tavily / Exa / Serper) — decide on price + recall | ⬜ | |
| 4.2 | Add `tools/web_search.ts` and `tools/fetch_url.ts` for the agent loop | ⬜ | |
| 4.3 | Implement `agents/researcher.ts` — Claude with tool use + multi-turn loop | ⬜ | Cap iterations to 8 to control cost |
| 4.4 | Output handoff: produces input for idea-writer or blog-writer (chained) | ⬜ | |
| 4.5 | Manual eval: 5 research runs, sanity-check citations | ⬜ | |

**Exit criteria:** Researcher produces a draft with cited sources. ~1 week.

---

## Phase 5a — Free Guided Chat (RAG)  (Status: ⬜ Not started)

Goal: Cheap, scoped chat helper for all visitors. Answers from Sanity content only, links to source pages.

| # | Task | Status | Notes |
|---|---|---|---|
| 5a.1 | Embedder agent (`agents/embedder.ts`) in worker — chunks Sanity ideas + posts, generates 768-dim embeddings via Gemini, upserts into `embeddings` table | ⬜ | |
| 5a.2 | Wire Sanity revalidate webhook ([app/api/revalidate/route.ts](../app/api/revalidate/route.ts)) to also enqueue a Cloud Task → embedder | ⬜ | Keeps embeddings fresh on publish |
| 5a.3 | Initial backfill: embed all existing content (~10k docs target) | ⬜ | One-time job; ~$2 in tokens |
| 5a.4 | `lib/chat/retrieve.ts` — embeds the user query, runs pgvector ANN search, returns top 3 chunks with source metadata | ⬜ | |
| 5a.5 | `app/api/chat/route.ts` — POST handler: tier=free → builds RAG prompt, calls Gemini Flash, streams response | ⬜ | Hard cap: `max_tokens: 250`, one turn, no tools |
| 5a.6 | System prompt: scoped to "answer only from these chunks; if not in scope, suggest related pages and stop" | ⬜ | |
| 5a.7 | Chat UI component (drawer or floating widget) wired into the site | ⬜ | |
| 5a.8 | Rate limit per IP/session (e.g. 20 messages/hour) using Postgres or upstash | ⬜ | |
| 5a.9 | Log every conversation to Postgres `chat_logs` table for later eval + paid-tier upsell signal | ⬜ | |
| 5a.10 | Manual eval: 20 sample queries, check answers are scoped + cite sources | ⬜ | |

**Exit criteria:** Anonymous user can ask "what's a good food business idea for ₹5L budget?" and get a 2-sentence answer with links to matching ideas. ~1 week.

---

## Phase 5b — Paid Full Chat (multi-turn agent)  (Status: ⬜ Not started)

Goal: Premium experience for paid users. Multi-turn, tool-using Claude Sonnet agent with web search.

**Do not start until 5a is live for 4+ weeks and has organic usage data showing where users hit the free tier's ceiling.**

| # | Task | Status | Notes |
|---|---|---|---|
| 5b.1 | Auth + paid-tier flag on user (decide provider — Clerk / NextAuth + Stripe) | ⬜ | Separate decision; not in scope of this plan |
| 5b.2 | Extend `/api/chat` route: tier=paid → Claude Sonnet 4.6 path with tools | ⬜ | |
| 5b.3 | Tools: `search_ideas` (GROQ), `search_posts`, `search_tenders` (Postgres), `web_search` | ⬜ | Reuse researcher's web search wrapper |
| 5b.4 | Multi-turn conversation history persisted in Postgres `conversations` table | ⬜ | |
| 5b.5 | Streaming response with tool-call display in UI | ⬜ | |
| 5b.6 | Prompt caching enabled on system prompt + tool definitions | ⬜ | ~80% input cost reduction |
| 5b.7 | Per-conversation hard caps: max 12 turns, max 50k total tokens | ⬜ | |
| 5b.8 | Optional Opus 4.7 "deep mode" for explicit user opt-in (e.g. "validate this business idea") | ⬜ | |
| 5b.9 | Stripe webhook → toggle `paid_until` column | ⬜ | |
| 5b.10 | Cancellation & dunning flows | ⬜ | |

**Exit criteria:** Paying user can have a 10-turn conversation that validates a business idea using tools. Cost per paying user tracked. ~2–3 weeks.

---

## Phase 6 — Observability & Cost Hardening  (Status: ⬜ Not started)

Run only after 2+ agents are live in prod.

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Deploy self-hosted **Langfuse** on Cloud Run for prompt-level tracing | ⬜ | |
| 6.2 | Wire all agents to log trace IDs to Langfuse | ⬜ | |
| 6.3 | GCP budget alerts per `agent=*` label | ⬜ | |
| 6.4 | Weekly cost-per-agent report (BigQuery billing export → simple SQL) | ⬜ | |
| 6.5 | Eval harness: rerun the 5–20 manual eval prompts per agent on every prompt change | ⬜ | |

---

## When to revisit the "no framework" decision

Add Mastra (or LangGraph for any branching agent) **only if** two or more of these become true:

- [ ] 4+ agents in production
- [ ] Shared infra (memory, eval harness, retries) is being duplicated across agents
- [ ] An agent has real graph behavior — branching, parallel sub-agents, human-in-the-loop
- [ ] Onboarding a new agent takes >1 day of plumbing before the prompt work starts

Until then, keep it flat.

---

## Open questions to resolve before Phase 1

- [ ] GCP project ID + region for `agents-worker` (confirm same as Cloud Run web app)
- [ ] Vertex region for Claude — `us-east5` is default; latency vs. quota tradeoff
- [ ] Sanity write token scope — separate token for the worker, narrower than the web app's
- [ ] Budget per agent for month 1 (sets `max_tokens` and rate-limit defaults)
- [ ] Postgres version & pgvector availability on the current instance (Cloud SQL ≥ 15 has it; verify)

## Open questions to resolve before Phase 5b

- [ ] Auth provider (Clerk vs NextAuth) and billing (Stripe vs Razorpay — India angle?)
- [ ] Free-tier rate limit ceiling (signal vs. friction)
- [ ] Paid tier pricing — informed by Phase 5a conversion data, not guessed upfront

---

## Status legend

- ⬜ Not started
- 🟡 In progress
- ✅ Done
- ⛔ Blocked (add a Notes line with the blocker)
