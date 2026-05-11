---
name: blog-writer
description: Generate and publish a long-form blog post for businessideas.live in the same voice and structure as the existing posts in scripts/seed-posts.mjs, with 3–6 internal links to business ideas. Use when the user runs /blog or asks to write/publish a new blog post.
---

# Blog Writer — End-to-End Workflow

You are writing for **businessideas.live** — a content site for Indian entrepreneurs. The blog backlinks to a library of "business ideas" (separate Sanity document type at `/business-ideas/<slug>`).

Follow these 9 steps in order. Do not skip. Do not ask questions.

---

## Step 1 — Verify environment

The agent **does not publish to Sanity itself** — it writes a seed script and pushes a `blog/<slug>` branch. A GitHub Action picks up the push, runs the seed script with the secrets it owns, publishes to Sanity, then merges and dispatches the deploy. This works identically in local and remote (`/schedule`) contexts.

The agent only needs:
- Git configured (committer email + push access)
- Network access to read public Sanity data (no token required for reads on a published dataset)

Check:
```bash
git config user.email > /dev/null && echo "OK: git configured" || echo "ABORT: git not configured"
git remote get-url origin > /dev/null && echo "OK: origin remote present" || echo "ABORT: no origin remote"
```

If either aborts, return `✗ Aborted at step 1: <reason>` and stop.

---

## Step 2 — Inventory existing content

Fetch existing post slugs/categories and idea slugs+industries+tags. Use the **public CDN client** — no token needed for reads on the production dataset:

```bash
node -e '
import("@sanity/client").then(async ({ createClient }) => {
  const c = createClient({ projectId: "5p3rso81", dataset: "production", apiVersion: "2024-01-01", useCdn: true });
  const posts = await c.fetch(`*[_type=="post" && defined(slug.current)]{ "slug": slug.current, title, category, tags, "coverAssetRef": cover_image.asset._ref, "coverUrl": cover_image.asset->url }`);
  const ideas = await c.fetch(`*[_type=="businessIdea" && defined(slug.current)]{ "slug": slug.current, title, industry, tags, budget_range }`);
  const catCounts = {};
  for (const p of posts) catCounts[p.category||"Uncategorized"] = (catCounts[p.category||"Uncategorized"]||0)+1;
  console.log(JSON.stringify({ totals: { posts: posts.length, ideas: ideas.length }, catCounts, posts, ideas }, null, 2));
});
' > /tmp/bi-inventory.json
```

Then `Read /tmp/bi-inventory.json` to load the inventory into context.

---

## Step 3 — Pick theme

**If user passed `auto` or empty:**
- From `catCounts`, find the under-represented categories. The fixed category list is: `Entrepreneurship`, `Market Research`, `Funding & Finance`, `Marketing & Growth`, `Technology`, `Operations`, `Mindset`, `Case Studies`.
- Currently weak categories: **Marketing & Growth, Operations, Mindset, Market Research, Case Studies**. Prefer one of these.
- Within the chosen category, propose a topic that does not duplicate any existing slug. Examples:
  - Marketing & Growth → "How Indian D2C Brands Get Their First 1,000 Customers"
  - Operations → "Inventory Management for Small Indian E-commerce Sellers"
  - Mindset → "Why Most Indian Founders Quit at Month 8 — and How to Stay"
  - Market Research → "How to Validate a Business Idea in India with ₹5,000 and 2 Weeks"
  - Case Studies → "How a Pune Tiffin Service Scaled to ₹1 Crore Without Funding"

**If user passed a theme string:** Use it verbatim. Don't paraphrase.

---

## Step 4 — Pick idea backlinks (3–6)

From `ideas`, pick 3–6 whose `industry` or `tags` align with the chosen theme. Spread across budget tiers if possible. Save the chosen `slug` + `title` pairs — you'll inline these into the Portable Text body using the `link` annotation.

---

## Step 5 — Study live posts, not just the seed file

The seed file shows mechanics; the **live posts** show voice and current site theme. Pull 3 recent posts from Sanity and read their full body to internalise tone, structure, and rhythm:

```bash
node -e '
import("@sanity/client").then(async ({ createClient }) => {
  const c = createClient({ projectId: "5p3rso81", dataset: "production", apiVersion: "2024-01-01", useCdn: true });
  // 3 most recent non-policy-pulse posts
  const samples = await c.fetch(`*[_type=="post" && defined(slug.current) && !("policy-pulse" in coalesce(tags,[]))] | order(published_at desc)[0...3]{ title, "slug": slug.current, excerpt, category, tags, body, faqs }`);
  console.log(JSON.stringify(samples, null, 2));
});' > /tmp/bi-samples.json
```

Then `Read /tmp/bi-samples.json` and pay attention to:
- **Voice & rhythm:** sentence length, paragraph cadence, when H2s appear, list-heavy vs prose-heavy
- **Indian context density:** ₹/lakh/crore, named regulators (FSSAI/Udyam/MSME/SEBI/GST), city references (Bangalore/Pune/Indore)
- **FAQ tone:** how questions are phrased, length of answers, presence of specific numbers
- **Tag patterns:** how many, lowercase, and whether they cross-reference other category names

Also `Read .claude/skills/blog-writer/publish-template.mjs` once for the new helpers — `pLink()` (inline backlinks) and the cover-image block.

---

## Step 5.5 — Research the topic (mandatory, no shortcuts)

A post drafted from training-data memory alone reads as AI-generated. To write something a human will trust, you must do real research now. **Do not skip this step.** Token budget is unlimited; quality is the only metric.

Run **at least 6 web searches** covering different facets of the chosen theme. Example queries for "Marketing for Indian D2C brands":

- `"Indian D2C brand" customer acquisition cost 2026`
- `Mamaearth boAt early growth strategy interview`
- `Instagram ads spend D2C India 2026`
- `India D2C market size FICCI report 2026`
- `D2C founder India failed lessons learned`
- `WhatsApp business API D2C conversion rate India`

Use `WebSearch` for the initial pass, then `WebFetch` to read the **3–5 most useful results in full** — founder interviews, real reports (RedSeer, Bain, Inc42, YourStory, Tracxn), regulatory pages (FSSAI/RBI/MEITY), and any government scheme documentation. Save the salient findings in working memory.

Specifically collect:

| What to extract | Why it matters |
|---|---|
| **2–4 dated, specific statistics** (with month/year + source name) | E.g. *"As of Q2 2025, Mamaearth's CAC was ₹520 per customer (Inc42 report, April 2025)."* Generic claims fail the human-test. |
| **2–3 real Indian founders/companies** with verifiable details | E.g. *Aman Gupta (boAt)*, *Ghazal Alagh (Mamaearth)* — name, city, business, and one specific milestone. |
| **1 contrarian or non-obvious insight** from a source | E.g. *"D2C brands in India spent 28% of revenue on Instagram in 2023; this dropped to 14% in 2025 as Performance Max stopped working."* — counterintuitive enough that a reader thinks "huh, I didn't know that." |
| **1 government scheme or regulation** that's genuinely relevant | E.g. *FSSAI 2.0 changes for D2C food brands, ONDC seller onboarding fee waiver, RBI's PA-PG circular.* |
| **1 fresh anecdote or quote** to weave in | Even a single line from a founder interview lands harder than 200 words of generic advice. |

After research, write a short notes file:

```bash
cat > /tmp/bi-research-<slug>.md << 'EOF'
# Research notes — <theme>
## Sources fetched
- <Article 1 title> — <URL>
- <Article 2 title> — <URL>
...
## Stats to use
- <stat 1 with source>
...
## Named entities
- <founder/company with one-line detail>
...
## Anecdote
- <one human story or quote>
EOF
```

You'll cite these in the body — not as footnotes, but woven into sentences naturally. **A draft that doesn't use the research notes is a failed draft.** Re-research if your first pass was too generic to be useful.

### Thesis (mandatory)

After research, write a **one-sentence thesis** at the top of `/tmp/bi-research-<slug>.md`. The thesis is the non-obvious claim the post will defend — what someone reading only the title and your post should walk away believing. Examples:

> ✅ *"D2C in India is no longer a marketing problem — it's a logistics-and-returns problem, and the brands winning in 2026 are the ones who solved warehouse density before they solved Instagram."*
>
> ✅ *"FSSAI's 2025 packaging rules killed the home-kitchen tiffin model for orders over ₹40,000/month, and the winners pivoted to dark-kitchen partnerships within 90 days."*
>
> ❌ *"Marketing for D2C is hard but rewarding."* — not a thesis, it's a platitude.
> ❌ *"You can start a tiffin service in India."* — descriptive, no claim.

If you can't articulate a thesis, your research wasn't deep enough — go back and dig until you find a non-obvious pattern. **Every post must defend a thesis.** No thesis, no draft.

---

## Step 6 — Draft the post

Produce these fields in memory:

| Field | Constraint |
|---|---|
| `title` | 50–80 chars, includes "India" or implies it |
| `slug` | kebab-case, ≤96 chars, must not collide with `posts[].slug` |
| `excerpt` | ≤300 chars, compelling hook |
| `seo_title` | ≤60 chars |
| `seo_description` | ≤160 chars |
| `category` | **single** primary value from the 8 fixed categories (pick the best fit) |
| `tags` | **5–9 lowercase tags**, must include any *other* category names that also apply (e.g. a Marketing & Growth post about D2C should also tag `entrepreneurship`, `case-studies` if relevant). This is how a post surfaces under multiple categories on the site. |
| `reading_time` | round(word_count / 220) |
| `body` | Portable Text, **1,500–6,000 words** — let the topic decide. Thin themes get 1,500–2,200; deep themes (case study, market analysis) get 3,500–6,000. Don't pad to hit a number. Must include: thesis (woven in), 8+ dated stats, 5+ named people, 2+ pull quotes, 2–4 post-to-post links, 0–6 idea backlinks, an "Updated as of" footer line. |
| `faqs` | 4–6 entries |
| `cover_image` | mandatory — set via `coverImage = { url, alt }` or `coverImage = { query, alt }`. See "Cover image strategy" below. |
| `featured` | always `false` |
| `published_at` | now (ISO) |
| `author` | `BusinessIdeas.live` |

### Cover image strategy

The post WILL appear on listing cards and the homepage with its `cover_image`, so it must be set. Pick **one** of these approaches in the seed script:

1. **Direct URL (default — no API key required):** Pick a relevant landscape photo from Unsplash and inline its URL. The search-result URL `https://images.unsplash.com/photo-<id>?w=1600&q=80` works. To find a fresh photo, run a Bash search via the public Unsplash search page (e.g. `curl -s "https://unsplash.com/s/photos/<theme>"` and grep for `photo-` IDs), or use a relevant photo ID from `scripts/seed-post-images.mjs` if the theme matches. **Never** reuse the same photo as an existing post — fetch the existing posts' image asset URLs first and pick a different photo ID.
2. **Unsplash search query (if `UNSPLASH_ACCESS_KEY` is in .env.local — CURRENTLY ACTIVE):** Set `coverImage = { query: '<broad theme phrase>', fallbackQueries: ['<broader phrase>', '<broadest phrase>'], alt: '<alt>' }`. The seed script hits the Unsplash search API and picks randomly from the top 5 results — fresh every run. **Keep the primary query 2–4 words and broadly photographable** (e.g. `'D2C founder packing orders'`, not `'indian d2c brand marketing first 1000 customers'`). Include 1–2 broader fallback queries in case the primary returns zero hits.

Write a descriptive alt that names the subject and context (e.g. `"D2C founder packing skincare orders in a small Bangalore studio"`), not a bland label.

### Body structure

The opening must follow ONE of three patterns — pick deliberately, declare your choice in working memory, then execute:

| Pattern | When to use | Example |
|---|---|---|
| **A. Scene** | When you have a vivid anecdote from research | *"At 6 AM in a Pune warehouse, Manish Sharma's team is hand-counting 2,400 returned skincare orders from the previous week. Each return costs ₹86 in reverse logistics. Last month, that line item ate 22% of net revenue."* |
| **B. Stat shock** | When you have a number readers won't believe | *"Indian D2C brands spent an average of ₹520 to acquire one customer in Q2 2025 — up 3.2× from 2020, according to RedSeer. The 14 brands that crossed ₹100Cr ARR did it with a CAC under ₹180."* |
| **C. What just changed** | When a recent event/regulation/data point pivots the narrative | *"In April 2025, FSSAI rule 2.6.3 reclassified home-kitchen tiffin services above ₹40,000/month as 'commercial food operators' — and the country's largest WhatsApp-only tiffin business shut down 11 days later."* |

After the opener, weave the **thesis from `/tmp/bi-research-<slug>.md`** into a single paragraph by paragraph 2 or 3. The reader should know what claim you're defending before any H2.

Then:

1. Opening (pattern A / B / C above)
2. Thesis paragraph
3. H2 — context section (with at least 1 stat, 1 named entity)
4. H2 — section 2 (with at least 1 stat, 1 named entity, 1 inline link — either `pLink` to an idea or `pLinkPost` to a related blog post)
5. H2 — section 3
6. H2 — section 4 (vary count by depth — case-study posts may have 6–8 H2s)
7. **Insert a `quote(...)` pull-quote block** roughly every 700 words. Use a real, sourced quote from research notes — or a punchy single-sentence summary of a key insight.
8. H2 — "Where to go from here" / closing transition (good place for `pLink` and `pLinkPost`)
9. H2 — closing thought / call to action
10. FAQs (4–6)
11. **Footer line:** `p("Last updated: <Month YYYY>")` at the very end of body — readers trust dated content.

### Linking discipline

Two link types, two purposes:

| Helper | Target | When to use |
|---|---|---|
| `pLink` | `/business-ideas/<slug>` | When the post discusses a business model that maps to a specific idea in our library |
| `pLinkPost` | `/blog/<slug>` | When a prior blog post explores a sub-topic deeper — knowledge-graph effect |

Aim for **2–4 `pLinkPost` cross-references** to prior posts that fit, plus **0–6 `pLink` backlinks** to ideas. Both must read naturally. A post that links to nothing is acceptable if nothing genuinely fits.

```js
pLink('See the ', [{ text: 'tiffin service idea', slug: 'tiffin-service' }], ' for revenue benchmarks.')
pLinkPost('We dug into this in ', [{ text: 'our piece on D2C unit economics', slug: 'd2c-unit-economics-india' }], '.')
```

---

## Step 7 — Self-review

Run every check in `checklist.md`. If any fails:
- Fix in memory.
- Re-run all checks.
- If still failing after 2nd pass, abort with `✗ Aborted at step 7: <which check failed>`.

---

## Step 7.5 — Fact-check loop (mandatory)

Self-review catches *form*. Fact-check catches *substance*. After the checklist passes, pick **2 random statistics** from the body and verify them independently:

1. For each picked stat, identify the source URL you cited in `/tmp/bi-research-<slug>.md`.
2. `WebFetch` that URL fresh (not cached). Confirm the page still says what you claim.
3. If the page is gone, paywalled, or contradicts your claim — **edit the stat in the body** to match what the source actually says, or remove it entirely.
4. Pick **1 named founder/company** from the body. Run a `WebSearch` for `"<name>" "<business>" India` and confirm they exist, are based where you said, and the milestone you cited is accurate.
5. If any fact-check fails twice, drop the claim from the body.

Document the fact-check in `/tmp/bi-research-<slug>.md`:

```
## Fact-check
- Stat 1: ✓ Verified at <URL>
- Stat 2: ✗ Source 404'd → claim removed
- Founder 1: ✓ Confirmed at <URL>
```

A hallucinated stat survives self-review but fails fact-check. This is the difference between an AI post and a researched post.

---

## Step 8 — Write the seed script (do NOT run it)

Copy `.claude/skills/blog-writer/publish-template.mjs` to `scripts/seed-post-<slug>.mjs` and fill it in with the drafted content.

**Do not execute the seed script.** The GitHub Action at `.github/workflows/auto-merge-blogs.yml` will run it after step 9's push, using repo secrets `SANITY_WRITE_TOKEN` and `UNSPLASH_ACCESS_KEY` it owns. The agent has no access to those secrets and should not attempt the publish.

---

## Step 9 — Commit to a `blog/<slug>` branch and push

The seed file lands on a dedicated `blog/<slug>` branch cut from latest `origin/main`. A GitHub Action (`.github/workflows/auto-merge-blogs.yml`) sees the push and merges the branch into `main`, which dispatches the deploy workflow. This avoids any direct push to `main` from the agent.

```bash
SLUG=<slug>
ORIG_BRANCH=$(git rev-parse --abbrev-ref HEAD)
BLOG_BRANCH="blog/$SLUG"

# Stash any tracked changes so the branch switch is clean.
# Untracked files (the new seed script) ride along across branches automatically.
HAS_TRACKED_CHANGES=$(git status --porcelain --untracked-files=no | wc -l | tr -d ' ')
if [ "$HAS_TRACKED_CHANGES" != "0" ]; then
  git stash push -m "blog-writer-autoswap-$SLUG" || { echo "ABORT: stash failed"; exit 1; }
fi

# Cut a new branch off the latest origin/main.
git fetch origin main || { echo "ABORT: fetch failed"; exit 1; }
git checkout -b "$BLOG_BRANCH" origin/main || { echo "ABORT: branch create failed"; exit 1; }

# Commit the seed file.
git add scripts/seed-post-$SLUG.mjs
git commit -m "blog: $SLUG"
SHORT_SHA=$(git rev-parse --short HEAD)

# Push the blog branch — the auto-merge-blogs Action merges into main from here.
git push -u origin "$BLOG_BRANCH" || { echo "ABORT: push failed"; exit 1; }

# Return to caller's branch and restore any stashed changes.
git checkout "$ORIG_BRANCH"
# Delete the local blog branch (the remote one is deleted by the Action after merge).
git branch -D "$BLOG_BRANCH" 2>/dev/null || true
if [ "$HAS_TRACKED_CHANGES" != "0" ]; then
  git stash pop || echo "WARN: stash pop had conflicts — please resolve manually"
fi

echo "✓ Pushed $SHORT_SHA to $BLOG_BRANCH — auto-merge Action will land it on main"
```

Capture `$SHORT_SHA` for the return message.

**How the post reaches production:**
1. Agent pushes `blog/<slug>` — visible on GitHub immediately.
2. `.github/workflows/auto-merge-blogs.yml` fires:
   - Installs deps + runs the seed script (this is where publish to Sanity happens, using repo secrets)
   - Merges `blog/<slug>` into `main` and deletes the blog branch
   - Dispatches `deploy.yml` to rebuild Cloud Run
3. Total wall-clock from push to "blog live in Sanity" is ~1–2 minutes (Action cold-start + npm ci + publish).
4. The Sanity revalidate webhook purges ISR caches the instant the publish lands — the post is visible at its URL without waiting for the Cloud Run deploy.

Return the success block defined in `.claude/agents/blog-writer.md`.

---

## Voice cheat sheet (aspire to this)

### Use freely

- Direct second person ("you"), present tense, contractions OK ("don't", "it's").
- **Specific over generic.** Always a number, name, city, or dated fact: "₹52 per pickup in Pune", not "low pickup costs". "Mamaearth's CAC in 2025 was ₹520" not "D2C brands have high CAC".
- Indian regulatory + financial idioms (lakh, crore, GST, MSME, FSSAI, Udyam, RBI, SEBI, AYUSH, Startup India, MEITY, ONDC).
- Short paragraphs (2–4 sentences). One idea per paragraph.
- Concrete openers: a scene, a stat, a named person — never a thesis sentence.
- Light internal rhythm: 1–2 short sentences after a long one. Read drafts aloud in your head.

### Voice red flags — never produce these

The following are dead AI tells. If your draft contains any of them, rewrite.

| Banned phrase / pattern | Why |
|---|---|
| *"In today's fast-paced world..."* / *"In the dynamic landscape of..."* | Generic AI opener. |
| *"It's important to note that..."* / *"It is worth mentioning..."* | Hedging filler. |
| *"Whether you're a... or a..., this guide will..."* | Listicle SEO cliché. |
| *"From X to Y, the possibilities are endless."* | Empty rhetoric. |
| *"Let's dive in / explore / delve into..."* | The most reliable AI tell. |
| *"Game-changer / revolutionize / leverage / streamline / synergy / unlock the power of"* | Buzzword soup. |
| Three consecutive sentences that begin with the same word | Rhythm flaw. |
| Lists where every item is exactly one sentence of similar length | Reads as auto-generated. |
| Statistics without a year / source ("70% of Indians prefer...") | Untrustworthy. Either cite or cut. |
| A founder name with no city / no specific milestone | Same as above. |
| The word "ultimately" or "in conclusion" before the last paragraph | AI conclusion-marker. |

### Surgically use research

Weave facts from Step 5.5 into sentences. Don't dump them in a "Statistics" block. Examples of *good* integration:

> By April 2025, Mamaearth's customer acquisition cost had climbed to ₹520 per buyer — up nearly 3× from its 2020 numbers — and founder Ghazal Alagh told Inc42 the brand had moved 40% of its ad spend out of Meta entirely.

vs. the *bad* version a memory-only draft produces:

> Customer acquisition costs in India have been rising for D2C brands. Founders are exploring new channels to reduce dependency on social media platforms.
