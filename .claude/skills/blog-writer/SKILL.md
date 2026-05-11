---
name: blog-writer
description: Generate and publish a long-form blog post for businessideas.live in the same voice and structure as the existing posts in scripts/seed-posts.mjs, with 3–6 internal links to business ideas. Use when the user runs /blog or asks to write/publish a new blog post.
---

# Blog Writer — End-to-End Workflow

You are writing for **businessideas.live** — a content site for Indian entrepreneurs. The blog backlinks to a library of "business ideas" (separate Sanity document type at `/business-ideas/<slug>`).

Follow these 9 steps in order. Do not skip. Do not ask questions.

---

## Step 1 — Verify environment

Run:

```bash
set -a && source .env.local 2>/dev/null && set +a
[ -n "$SANITY_WRITE_TOKEN" ] && echo "OK: write token present" || \
  ([ -f ~/.config/sanity/config.json ] && echo "OK: sanity CLI auth present" || echo "ABORT: no sanity auth")
git config user.email > /dev/null && echo "OK: git configured" || echo "ABORT: git not configured"
```

The seed scripts auto-load `.env.local`-style env vars only when sourced — so every Node invocation in this workflow must be run via `set -a && source .env.local && set +a && node …`. If neither token nor CLI auth is found, return `✗ Aborted at step 1: <reason>` and stop.

---

## Step 2 — Inventory existing content

Run this single Node script to fetch existing post slugs/categories and all idea slugs+industries+tags:

```bash
node -e '
import("@sanity/client").then(async ({ createClient }) => {
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  const cfg = JSON.parse(readFileSync(join(process.env.HOME, ".config/sanity/config.json"), "utf8"));
  const c = createClient({ projectId: "5p3rso81", dataset: "production", apiVersion: "2024-01-01", token: cfg.authToken, useCdn: false });
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
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  let tk = process.env.SANITY_WRITE_TOKEN;
  if (!tk) try { tk = JSON.parse(readFileSync(join(process.env.HOME, ".config/sanity/config.json"), "utf8")).authToken } catch {}
  if (!tk) tk = process.env.SANITY_API_TOKEN;
  const c = createClient({ projectId: "5p3rso81", dataset: "production", apiVersion: "2024-01-01", token: tk, useCdn: false });
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
| `body` | Portable Text, 2200–3500 words. **0–6 inline `pLink` backlinks** — only when contextually relevant. Don't force a link into a paragraph that doesn't need one. |
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

1. Opening paragraph — set the scene, hook the reader.
2. H2 — context section.
3. H2 — main body section 1.
4. H2 — main body section 2.
5. H2 — main body section 3.
6. H2 — "Where to go from here" or similar closing transition. **If you have backlinks to add, this is where 1–2 of them naturally fit.**
7. H2 — closing thought / call to action.
8. FAQs.

Internal links use the inline `link` annotation via `pLink`:
```js
pLink('Many founders pair this with a ', [{ text: 'tiffin service business', slug: 'tiffin-service' }], ' to diversify revenue.')
```

**Backlink guidance:** include a `pLink` only when the linked idea is genuinely relevant to the surrounding sentence. A post with 0 backlinks is acceptable if no idea fits. A post with 6 backlinks is fine if all 6 are natural. Forced linking hurts SEO and reader trust — don't do it.

---

## Step 7 — Self-review

Run every check in `checklist.md`. If any fails:
- Fix in memory.
- Re-run all checks.
- If still failing after 2nd pass, abort with `✗ Aborted at step 7: <which check failed>`.

---

## Step 8 — Write and run the seed script

1. Copy `.claude/skills/blog-writer/publish-template.mjs` to `scripts/seed-post-<slug>.mjs` and fill it in with the drafted content.
2. Run (with env loaded):
   ```bash
   set -a && source .env.local && set +a && node scripts/seed-post-<slug>.mjs
   ```
3. Confirm output shows `✓ Published: <title>`. If it shows `SKIP` (slug collision) or any error, abort.

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
2. `.github/workflows/auto-merge-blogs.yml` fires, merges into `main`, deletes the blog branch.
3. The Action dispatches `deploy.yml` (via `workflow_dispatch`) which rebuilds Cloud Run.
4. Independently, the Sanity revalidate webhook already purged the page when step 8 ran — the blog is visible at its URL within seconds, regardless of the deploy.

Return the success block defined in `.claude/agents/blog-writer.md`.

---

## Voice cheat sheet (mimic this)

- "India is witnessing an unprecedented entrepreneurship boom." (real opener from an existing post)
- "Gross margins of 55–70%. FSSAI license required."
- "Start with 2–3 clients at ₹8,000–₹15,000/month each."
- Direct second person ("you"), present tense.
- Specific numbers always. Vague benefits never.
- Indian regulatory + financial idioms (lakh, crore, GST, MSME, ITR, Startup India).
