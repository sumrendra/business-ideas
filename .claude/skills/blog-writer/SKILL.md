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
  const posts = await c.fetch(`*[_type=="post" && defined(slug.current)]{ "slug": slug.current, title, category, tags }`);
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

## Step 5 — Read the canonical example

`Read scripts/seed-posts.mjs` (just the first 200 lines is enough). Note:
- The Portable Text helpers (`p`, `h2`, `h3`, `li`, `num`, `faq`)
- The voice: direct, Indian-context, ₹ amounts, mentions of FSSAI/Udyam/MSME/SEBI etc.
- Heading rhythm: H2 every ~250–400 words, list-heavy
- FAQs: 4–6 per post, conversational tone, specific numbers

Then `Read .claude/skills/blog-writer/publish-template.mjs` for the new helpers — it adds `pLink(text, links)` for inline-linked paragraphs.

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
| `category` | one of the 8 fixed values |
| `tags` | 4–8 lowercase tags |
| `reading_time` | round(word_count / 220) |
| `body` | Portable Text, 2200–3500 words, with **3–6 inline links** to business-ideas |
| `faqs` | 4–6 entries |
| `featured` | always `false` |
| `published_at` | now (ISO) |
| `author` | `BusinessIdeas.live` |

**Body structure (mandatory):**

1. Opening paragraph — set the scene, hook the reader.
2. H2 — context section.
3. H2 — main body section 1 (with at least 1 inline link to a business idea via `pLink`).
4. H2 — main body section 2 (with at least 1 inline link).
5. H2 — main body section 3 (with at least 1 inline link).
6. H2 — "Where to go from here" — bullets/links to related ideas, 2+ links.
7. H2 — closing thought / call to action.
8. FAQs.

Internal links use the inline `link` annotation. Format in the seed script:
```js
pLink('Many founders pair this with a ', [{ text: 'tiffin service business', slug: 'tiffin-service' }], ' to diversify revenue.')
```

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

## Step 9 — Commit and push to main

The seed file must land on `main` so the Cloud Run deploy workflow fires and the post is part of the production history. Run this exact sequence — it preserves the caller's working branch and any uncommitted work.

```bash
SLUG=<slug>
ORIG_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Stash any tracked changes so the branch switch is clean.
# Untracked files (including the new seed script) ride along across branches — they're not tied to a branch.
HAS_TRACKED_CHANGES=$(git status --porcelain --untracked-files=no | wc -l | tr -d ' ')
if [ "$HAS_TRACKED_CHANGES" != "0" ]; then
  git stash push -m "blog-writer-autoswap-$SLUG" || { echo "ABORT: stash failed"; exit 1; }
fi

# Switch to main and pull latest.
git fetch origin main || { echo "ABORT: fetch failed"; exit 1; }
git checkout main || { echo "ABORT: checkout main failed"; exit 1; }
git pull --ff-only origin main || { echo "ABORT: pull failed (main has diverged)"; exit 1; }

# Commit the seed file (no [skip ci] — we want the deploy to fire).
git add scripts/seed-post-$SLUG.mjs
git commit -m "blog: $SLUG"
SHORT_SHA=$(git rev-parse --short HEAD)
git push origin main || { echo "ABORT: push failed"; exit 1; }

# Return to caller's branch and restore any stashed changes.
git checkout "$ORIG_BRANCH"
if [ "$HAS_TRACKED_CHANGES" != "0" ]; then
  git stash pop || echo "WARN: stash pop had conflicts — please resolve manually"
fi

echo "✓ Pushed $SHORT_SHA to main"
```

Capture `$SHORT_SHA` for the return message.

**Important:** the commit message has no `[skip ci]` tag — pushes to `main` are expected to trigger `.github/workflows/deploy.yml`. The blog is already live in Sanity by this step (step 8); the deploy is just to keep the production history consistent.

Return the success block defined in `.claude/agents/blog-writer.md`.

---

## Voice cheat sheet (mimic this)

- "India is witnessing an unprecedented entrepreneurship boom." (real opener from an existing post)
- "Gross margins of 55–70%. FSSAI license required."
- "Start with 2–3 clients at ₹8,000–₹15,000/month each."
- Direct second person ("you"), present tense.
- Specific numbers always. Vague benefits never.
- Indian regulatory + financial idioms (lakh, crore, GST, MSME, ITR, Startup India).
