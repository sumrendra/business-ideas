# Blog Post Self-Review Checklist

Run every check before publishing. If any fails, fix and re-run. Abort after 2 failed passes.

## Metadata

- [ ] `title` is 50–80 characters
- [ ] `slug` is kebab-case, ≤96 chars, **not already in** `posts[].slug` from the inventory
- [ ] `excerpt` is ≤300 characters and reads as a standalone hook (not a generic summary)
- [ ] `seo_title` is ≤60 characters
- [ ] `seo_description` is ≤160 characters
- [ ] `category` is exactly one of: `Entrepreneurship`, `Market Research`, `Funding & Finance`, `Marketing & Growth`, `Technology`, `Operations`, `Mindset`, `Case Studies`
- [ ] `tags` contains 4–8 lowercase strings, all relevant
- [ ] `reading_time` ≈ word_count / 220 (rounded)
- [ ] `featured` is `false`
- [ ] `author` is `BusinessIdeas.live`
- [ ] `published_at` is a valid ISO datetime (current time)

## Body

- [ ] Word count is 2,200–3,500 (count text spans only, ignore Portable Text wrappers)
- [ ] Body has at least 5 H2 headings
- [ ] Body contains **3 to 6** inline links to `/business-ideas/<slug>`
- [ ] Every linked slug exists in the inventory's `ideas[].slug` (no broken links)
- [ ] No duplicate idea slug is linked more than once
- [ ] Voice matches `scripts/seed-posts.mjs`: Indian context (₹, lakhs/crores, FSSAI/MSME/Udyam/GST where relevant), specific numbers, direct second person
- [ ] No hedging filler ("In today's fast-paced world", "It is important to note that")
- [ ] No emojis anywhere in the post

## FAQs

- [ ] 4–6 FAQ entries
- [ ] Each `question` is a real question someone would Google
- [ ] Each `answer` is 1–3 sentences with at least one specific number, name, or rule

## Portable Text validity

- [ ] Every block has a unique `_key`
- [ ] Every span inside a block has a unique `_key`
- [ ] Any block using a `link` annotation has a non-empty `markDefs` array, and the span's `marks` array contains the matching `_key`
- [ ] Link `href` values use the `/business-ideas/<slug>` format (not full URLs, not the studio path)

## Pre-publish guards

- [ ] `slug` is not present in `posts[].slug` from the inventory (run a final fetch right before publishing if uncertain)
- [ ] The seed script file at `scripts/seed-post-<slug>.mjs` does not already exist on disk
- [ ] `git status` shows the new seed file as untracked (i.e. you haven't accidentally staged something else)
