# AI Agents — Detailed Cost Breakdown

> Detailed pricing reference for the agent stack defined in [agents-plan.md](agents-plan.md).
> All figures are mid-2026 USD, list price (no committed-use discounts), monthly unless noted.
> **Treat ±20% as realistic precision** — LLM and GCP prices move; re-check before any contract.

---

## 1. Vendor list prices (reference)

### LLM token prices (per 1M tokens, USD)

| Model | Input | Output | Cached input | Notes |
|---|---|---|---|---|
| Claude Opus 4.7 (Vertex / Anthropic) | $15.00 | $75.00 | $1.50 | Premium reasoning, paid deep mode only |
| Claude Sonnet 4.6 (Vertex / Anthropic) | $3.00 | $15.00 | $0.30 | Default for writers + paid chat |
| Claude Haiku 4.5 (Vertex / Anthropic) | $1.00 | $5.00 | $0.10 | Fallback for cost-sensitive tasks |
| Gemini 2.5 Pro (Vertex) | $1.25 | $10.00 | — | Long-context analysis |
| Gemini 2.5 Flash (Vertex) | $0.30 | $2.50 | — | Bulk extraction, free guided chat |
| Gemini `text-embedding-004` (Vertex) | $0.025 per 1M chars | — | — | Embeddings for RAG |

Cached input prices apply when prompt caching is enabled on Anthropic models — typically **~10× cheaper** for the cached portion.

### GCP infrastructure prices

| Service | Price | Unit |
|---|---|---|
| Cloud Run Service (request-driven) | $0.000024 / vCPU-second, $0.0000025 / GiB-second | Active request time |
| Cloud Run Jobs | Same per-second pricing | Whole job duration |
| Cloud Storage Standard | $0.020 / GB-month | Storage |
| Cloud Storage egress (same region) | $0.00 | Free |
| Cloud Storage egress (different region/internet) | $0.12 / GB | Capped beyond volume |
| Cloud Tasks | $0.40 / million operations | First 1M/mo free |
| Cloud Scheduler | $0.10 / job / month | First 3 jobs free |
| Cloud Logging | $0.50 / GiB ingested | First 50 GiB/mo free |
| Cloud SQL (Postgres, db-f1-micro) | ~$10/month | Already provisioned |
| Vertex AI API calls | Per token (above) | No separate API fee |
| BigQuery (future) | $6.25 / TiB query (on-demand) | First 1 TiB/mo free |

### Third-party

| Service | Price |
|---|---|
| Tavily web search (basic) | $0.005 / search |
| Serper web search | $1 / 1000 queries |
| Exa web search | $5 / 1000 queries |
| Sanity Free | $0 — 3 users, 10k docs, 1M CDN req, 100GB bandwidth, 10GB assets |
| Sanity Growth | $15 / user / month — 20 users, 25k docs |

---

## 2. Per-agent cost at max intended load

**Max load assumptions** (what these agents would do if all features are live and running hot):

| Agent | Volume / month | Tokens / run |
|---|---|---|
| Idea writer | 300 ideas (10/day) | 5k in + 8k out |
| Blog writer | 150 posts (5/day) | 5k in + 10k out |
| Scraper | 6,000 page extractions (120 runs × 50 pages) | 10k in + 1k out per page |
| Researcher | 150 runs (5/day) | 40k in + 16k out (multi-turn) |
| Embedder | 5,000 chunks/mo (new + updated content) | 1.5k chars / chunk |
| Free guided chat | 15,000 conversations | 3k in + 0.25k out (RAG, one turn) |
| Paid full chat | 5,000 conversations × 500 users | 15k in + 5k out (multi-turn) |

### Idea Writer — Claude Sonnet 4.6

| Component | Calculation | Cost |
|---|---|---|
| Input tokens | 300 × 5k = 1.5M | 1.5 × $3 = $4.50 |
| Output tokens | 300 × 8k = 2.4M | 2.4 × $15 = $36.00 |
| Cloud Run Jobs compute | 300 × 2 min × $0.000024/sec | $0.86 |
| **Subtotal** | | **~$41 / month** |

### Blog Writer — Claude Sonnet 4.6

| Component | Calculation | Cost |
|---|---|---|
| Input tokens | 150 × 5k = 0.75M | 0.75 × $3 = $2.25 |
| Output tokens | 150 × 10k = 1.5M | 1.5 × $15 = $22.50 |
| Cloud Run Jobs compute | 150 × 3 min × $0.000024/sec | $0.65 |
| **Subtotal** | | **~$25 / month** |

### Scraper — Gemini Flash extraction

| Component | Calculation | Cost |
|---|---|---|
| Input tokens (HTML) | 6,000 × 10k = 60M | 60 × $0.30 = $18 |
| Output tokens | 6,000 × 1k = 6M | 6 × $2.50 = $15 |
| Cloud Run Jobs compute | 120 × 30 min × 2 GiB | $6.30 |
| GCS storage (raw HTML, year-1 avg) | ~36GB × $0.020 | $0.72 |
| **Subtotal** | | **~$40 / month** |

### Researcher — Claude Sonnet 4.6 + web search

| Component | Calculation | Cost |
|---|---|---|
| Input tokens | 150 × 40k = 6M | 6 × $3 = $18 |
| Output tokens | 150 × 16k = 2.4M | 2.4 × $15 = $36 |
| Web search (Tavily) | 150 × 5 = 750 searches | $3.75 |
| Cloud Run Jobs compute | 150 × 5 min × $0.000024/sec | $1.10 |
| **Subtotal** | | **~$59 / month** |

### Embedder — Gemini text-embedding-004

| Component | Calculation | Cost |
|---|---|---|
| Embedding (monthly upserts) | 5,000 chunks × 1.5k chars = 7.5M chars | 7.5 × $0.025 = $0.19 |
| Initial backfill (one-time) | 50k chunks × 1.5k chars = 75M chars | $1.88 (one-time) |
| **Subtotal (recurring)** | | **<$1 / month** |

### Free Guided Chat — Gemini Flash + RAG

| Component | Calculation | Cost |
|---|---|---|
| Query embeddings | 15,000 × 100 chars = 1.5M chars | 1.5 × $0.025 = $0.04 |
| Input tokens (RAG context) | 15,000 × 3k = 45M | 45 × $0.30 = $13.50 |
| Output tokens | 15,000 × 0.25k = 3.75M | 3.75 × $2.50 = $9.38 |
| Cloud Run Service uplift (chat traffic) | ~+15% baseline | ~$15 |
| **Subtotal** | | **~$40 / month** |

### Paid Full Chat — Claude Sonnet 4.6 + tools

| Component | Calculation | Cost |
|---|---|---|
| Input tokens (with prompt caching) | 5,000 × 15k = 75M, 80% cached | 15M × $3 + 60M × $0.30 = $63 |
| Output tokens | 5,000 × 5k = 25M | 25 × $15 = $375 |
| Tool calls (web search via Tavily) | ~5,000 searches | $25 |
| Cloud Run Service uplift | ~+10% baseline | ~$10 |
| **Subtotal** | | **~$475 / month** |

### Shared infrastructure

| Component | Calculation | Cost |
|---|---|---|
| Cloud Tasks | ~50k ops/mo | <$0.05 |
| Cloud Scheduler | ~10 jobs | $1.00 |
| Cloud Logging | ~20 GiB ingested | $0 (under free tier) |
| Postgres extra storage (embeddings + chat logs) | ~2 GB | ~$0.50 |
| Langfuse self-hosted (Cloud Run + Postgres) | small instance | ~$15 |
| **Subtotal** | | **~$17 / month** |

---

## 3. Scenario totals

### Scenario A: Background agents only (no chat at all)

| Item | Monthly cost |
|---|---|
| Idea writer | $41 |
| Blog writer | $25 |
| Scraper | $40 |
| Researcher | $59 |
| Embedder | $1 |
| Shared infra | $17 |
| **Total** | **~$185 / month** |

### Scenario B: Background + free guided chat (no paid tier yet)

| Item | Monthly cost |
|---|---|
| Scenario A subtotal | $185 |
| Free guided chat | $40 |
| **Total** | **~$225 / month** |

### Scenario C: Full stack (background + free chat + paid chat at 500 paying users)

| Item | Monthly cost |
|---|---|
| Scenario B subtotal | $225 |
| Paid full chat | $475 |
| **Total** | **~$700 / month** |

**Revenue offset:** 500 users × $10/mo = **$5,000 revenue**. Net of LLM cost: **+$4,300/mo gross margin** before Stripe fees.

### Scenario D: Original unconstrained chat (the plan we rejected)

| Item | Monthly cost |
|---|---|
| Background agents | $185 |
| Unconstrained Claude chat for all users at 15k convos/mo | $1,800 |
| **Total** | **~$2,000 / month** |

**Switching from D → C cuts monthly cost ~65% AND adds a revenue stream.**

---

## 4. Sensitivity — what if volume changes?

| Driver | If 2× higher | If 5× higher |
|---|---|---|
| Free chat conversations | +$40 | +$160 |
| Paid users | +$475 | +$1,900 (offset by +$20k revenue) |
| Scraper pages | +$33 | +$130 |
| Writer agents | +$33 | +$130 |

Free chat scales gracefully because per-conversation cost is tiny (~$0.003). Paid chat scales with paying users and is revenue-positive at any volume. Writers scale linearly but capped by your editorial bandwidth, not cost.

**The risk-tail is bugs, not volume.** A runaway loop in the researcher or a leaked free-chat without rate limits can burn $100+ before alerts fire. See guardrails below.

---

## 5. Cost-reduction levers (ordered by impact)

| Lever | Saves | Effort |
|---|---|---|
| Prompt caching on paid chat | ~$250/mo | 1 line of code |
| Hard `max_tokens` cap per agent | ~$50/mo per writer | Trivial |
| Free chat rate limit per IP (20 msg/hour) | Prevents abuse — capped at $40 | Half day |
| Haiku 4.5 fallback for "simple" paid queries | ~$150/mo | 2 days (router) |
| Cap researcher iterations to 6 (from 8) | ~$15/mo | Trivial |
| Sample scraper pages (10 / 50 per run) | ~$30/mo | Half day |
| Defer Opus deep mode until users ask | ~$200/mo | Just don't ship it |
| Use Gemini Flash for blog draft "first pass", Claude only for polish | ~$15/mo | 2 days |

---

## 6. Hard cost guardrails (must-have, day one)

These exist to limit blast radius from bugs, not to optimize.

| Guardrail | Where to set |
|---|---|
| GCP budget alerts at $50 / $200 / $500 thresholds | GCP billing |
| Per-agent monthly token ceiling (worker exits if exceeded) | `llm/anthropic.ts` counter, Postgres row |
| Per-conversation max turns (free: 1; paid: 12) | `/api/chat` route |
| Per-IP free chat rate limit (20 msg/hour) | Middleware |
| Per-Cloud-Run-Job max duration (15 min default, 60 min researcher) | Cloud Run Job spec |
| Per-user paid chat monthly token cap (e.g. 500k tokens) | Postgres row, enforce in route |

---

## 7. Excluded costs

- **One-time engineering** (your / contributor time) — not priced
- **Sanity Growth tier** — only triggered by site traffic, not agents. Free tier covers ≥10k docs and ~1M CDN req/mo. Re-price when you cross either limit.
- **Auth + billing infra** (Clerk + Stripe) — separate decision, ~$25–50/mo at <1k users
- **Domain, TLS, base Cloud Run web app** — already paid for outside this scope
- **Future BigQuery analytics** — currently $0 (under 1 TiB/mo free); price separately when activated

---

## 8. How to verify these numbers monthly

1. **GCP billing report**, filter by label `agent=*` — shows per-agent compute + Vertex spend.
2. **Anthropic usage dashboard** (if any direct API calls remain outside Vertex).
3. **Postgres `chat_logs` table** — count conversations × your per-turn token average for chat sanity check.
4. **Langfuse cost tracking** (Phase 6) — automatic per-trace cost rollup, lets you spot the 10% of users driving 90% of cost.

If actuals diverge >30% from this doc, **update this doc**. Don't let it rot.
