# Blog Post Self-Review Checklist

Run every check before publishing. If any fails, fix and re-run. Abort after 2 failed passes.

## Metadata

- [ ] `title` is 50–80 characters
- [ ] `slug` is kebab-case, ≤96 chars, **not already in** `posts[].slug` from the inventory
- [ ] `excerpt` is ≤300 characters and reads as a standalone hook (not a generic summary)
- [ ] `seo_title` is ≤60 characters
- [ ] `seo_description` is ≤160 characters
- [ ] `category` is exactly one of: `Entrepreneurship`, `Market Research`, `Funding & Finance`, `Marketing & Growth`, `Technology`, `Operations`, `Mindset`, `Case Studies`
- [ ] `tags` contains 5–9 lowercase strings, all relevant
- [ ] At least 1 tag matches a *different* category name (lowercased, with `&` replaced) — so the post surfaces under multiple category views. E.g. a Marketing & Growth post that fits Entrepreneurship too should include `entrepreneurship` as a tag.
- [ ] `reading_time` ≈ word_count / 220 (rounded)
- [ ] `featured` is `false`
- [ ] `author` is `BusinessIdeas.live`
- [ ] `published_at` is a valid ISO datetime (current time)
- [ ] `coverImage` block in the seed script has either a real `url` (not `__COVER_URL__`) or a real `query`, and a descriptive non-empty `alt`
- [ ] The chosen cover photo is not already used by another post (cross-check the `existingCoverIds` list fetched at step 2)

## Body

- [ ] Word count is **1,500–6,000** — and matches the topic depth (thin theme → ≤2,200; deep theme → ≥3,500). Padding to hit a number is a fail.
- [ ] Body has at least 5 H2 headings (deeper posts may have 6–8)
- [ ] **Opening matches one of the 3 declared patterns** (Scene / Stat shock / What just changed) — generic thesis-sentence openers fail
- [ ] **Thesis from `/tmp/bi-research-<slug>.md` appears in body** (woven into paragraph 2 or 3, not as a separate "Thesis:" label)
- [ ] Body contains **0 to 6** inline `pLink` backlinks to `/business-ideas/<slug>` — only when natural
- [ ] Body contains **2 to 4** inline `pLinkPost` cross-references to `/blog/<slug>` for related prior posts (knowledge-graph effect)
- [ ] Body contains **2+ pull-quote blocks** (`quote(...)` helper) at roughly even intervals (~every 700 words)
- [ ] Body ends with `p("Last updated: <Month YYYY>")` as the final block before FAQs
- [ ] Every linked slug (idea or post) exists in the inventory (no broken links)
- [ ] No duplicate slug is linked more than once
- [ ] Voice matches the **live posts** from `/tmp/bi-samples.json`: Indian context (₹, lakhs/crores, FSSAI/MSME/Udyam/GST), specific numbers, direct second person, contractions OK
- [ ] No emojis anywhere in the post

## Research grounding (mandatory — fails if not met)

- [ ] `/tmp/bi-research-<slug>.md` starts with a **one-sentence thesis** that the post defends
- [ ] At least **8 dated, named-source statistics** in the body. Each stat must include: number + month-or-quarter + year + source publication (e.g. *"Inc42 reported in Q3 2025 that..."*). Stats without a year fail.
- [ ] At least **5 real Indian founders or companies** named with a verifiable detail set: name + city + business + one specific milestone. Generic mentions ("a Bangalore founder") don't count.
- [ ] At least **1 contrarian or non-obvious insight** that a memory-only draft wouldn't produce. Often this IS the thesis.
- [ ] At least **1 specific regulation, scheme, or institutional reference** (FSSAI rule, ONDC, RBI circular, Startup India scheme, MUDRA loan, MEITY notification, etc.)
- [ ] `/tmp/bi-research-<slug>.md` lists **3–5 source URLs actually fetched** during research. Spot-check: pick a stat from the body; it must trace back to one of those URLs.
- [ ] **Fact-check section (Step 7.5)** is present in `/tmp/bi-research-<slug>.md` with at least 2 verified stats and 1 verified founder/company.

## Anti-AI sniff test (run on your own draft)

- [ ] **Banned phrase scan:** body does NOT contain any of these (case-insensitive): `in today's`, `fast-paced`, `dynamic landscape`, `it's important to note`, `it is worth`, `whether you're a`, `the possibilities are endless`, `let's dive in`, `let's explore`, `let's delve`, `game-changer`, `revolutionize`, `leverage`, `streamline`, `synergy`, `unlock the power`, `ultimately`, `in conclusion`, `embark on`, `navigate the complexities`, `harness the power`.
- [ ] **Opener test:** the first sentence is a concrete scene, a specific stat, or a named person — NOT a thesis or a generic claim.
- [ ] **Rhythm test:** no three consecutive sentences start with the same word. No five consecutive bullets are roughly the same length and form a "listicle drone".
- [ ] **Sound test (mental read-aloud):** if you read the draft in your head, does it sound like a human who has opinions, or like a polished encyclopedia entry? If the latter — rewrite the first 3 paragraphs and the closing section with sharper voice.
- [ ] **Hallucination guard:** every founder name, company name, statistic, and law / scheme reference in the body traces back to a real source URL in `/tmp/bi-research-<slug>.md`. If you can't trace it, delete the claim.

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
