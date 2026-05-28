# Product

> **Market focus: India only.** Every design, copy, data, and monetization decision should assume an Indian reader, Indian regulations (MCA, DPIIT, MSME, RBI, GST), and Indian currency (₹ in lakhs / crores). If a design choice would feel equally at home on an American SaaS site, it is wrong by default.

## Register

brand

> Reasoning: this is a content + SEO surface, not an app. Landing hero, blog, idea listings, sector pages, FAQ schema, sitemap discipline, sponsored partners. The newer /startups + /tools areas have product-like filters and search, but the primary surface is editorial. Register override per task is fine for the tool surfaces (calculators, screener, hyperlocal map), but the default that shapes the site identity is brand.

## Users

Three audiences, in order of traffic share. Every page should be readable to all three; few pages should try to serve all three at once.

1. **Aspiring founders.** Pre-revenue, India, mostly tier-2/3 cities, 20s to 40s. Came in from a Google search like "low investment business ideas in India" or "how to start a tiffin service." Budget-conscious, skeptical of upsells, will bounce if the page reads like an American SaaS template. Default device: Android mid-range phone on 4G. Reading in Hindi-English code-switch.
2. **Active small-business owners.** Already running something (kirana, salon, freelance studio, small D2C brand). Here to find ideas to expand, government schemes they qualify for, or competitive intel on their sector. Tolerates more density. Cares about real numbers (margins, payback period, employee count) more than inspiration.
3. **Researchers, students, journalists, ecosystem people.** Coming in to /startups profiles, /policy-pulse, sector pages. Cite us in their work if the data and provenance are credible. Lower volume, but they shape the site's reputation upstream.

All three are doing the same job: turning vague "I want to do something" into a concrete next step, with real Indian numbers.

## Product Purpose

A definitive Indian-entrepreneur knowledge platform. The web has a lot of "8 profitable business ideas for 2026" listicles, plus a few expensive databases like Tracxn, with very little in between for the reader who wants real Indian numbers, real founder stories, and real funding routes in one place.

Success looks like: the reader walks away with a concrete next step. Apply to a specific scheme. Read one founder profile that matches their situation. Bookmark one calculator. Subscribe to the newsletter. Not "fill out a contact form for a generic sales call."

Monetization (today): SEO traffic, sponsored partner placements (banks, government schemes), lead-gen for funding products. The design must support those without ever feeling like the page is a billboard. Sponsored content is labeled, contained, and visually quieter than editorial content. Trust is the moat; spending it on bad ad UX is the fastest way to lose it.

## Brand Personality

Three words: **Practical. Grounded. India-first.**

- **Practical.** Lead with numbers. Show the work. If we say "high margin," show the percentage. If we say "fastest-growing sector," show the trendline. No motivational poster energy.
- **Grounded.** Optimistic but not breathless. The voice is a friend who has actually run a business in India and is telling you what they wish they had known, not a coach trying to sell you a course.
- **India-first.** ₹ everywhere. State-specific schemes called out by state. MCA, DPIIT, MSME, PMEGP, MUDRA used by name (with a one-line "what this means"). Tier-2/3 city examples preferred over Bangalore-Mumbai-Delhi clichés. Hindi-English code-switching in copy is fine when it fits.

The visual tone follows from that: clear, dense in the right places, generous in others, with one or two confident accent moments per page rather than uniform decoration everywhere.

## Anti-references

What this site should explicitly NOT look or read like, with reasoning so judgment calls have a guide:

- **VC-Twitter SaaS landing pages.** Stripe-purple gradients on every hero, abstract isometric illustrations, "supercharge your growth" copy, marquee logos of companies the reader has never heard of. Reason: our audience is not enterprise buyers; this aesthetic reads as foreign and corporate.
- **Generic Indian business-directory aesthetics.** JustDial, IndiaMart, Sulekha. Yellow CTAs, cramped grids, four ads per fold, no whitespace, modal popups within five seconds. Reason: that aesthetic is the floor we are explicitly above. We are not a classifieds site.
- **Medium-style "8 Ideas For [Year]" listicle farms.** Stock photos, listicle structure, no real numbers, AI-paraphrased content. Reason: we lose to those sites if we copy their look; we win if we look like a credible publication.
- **Fintech glassmorphism dashboards.** Frosted gradient cards on dark navy backgrounds, "Total Revenue ↑12%" hero metric template, neon gradient borders. Reason: this is the default AI-slop visual right now and our site is content, not a dashboard, so the aesthetic is wrong on both axes.
- **Crypto-on-neon, "trading-floor" energy.** Black backgrounds with electric green numbers, treemap charts, ticker tape. Reason: wrong register, wrong audience.

If a section we are building could be guessed at as "Indian business listicle site" from the screenshot alone, we have not gone far enough. If it could be guessed at as "American SaaS landing," we have gone too far in the other direction. The destination is somewhere editorial publications live (think Rest of World, The Ken, Stratechery's restraint applied to Indian small business).

## Design Principles

Five principles to settle judgment calls when the visual rules below stop being enough.

1. **Numbers carry the page.** Wherever a real number exists (revenue, margin, payback months, scheme eligibility cap, MCA filing year), it should be a first-class typographic element, not hidden in a sentence. Reader trust comes from receipts, not adjectives.
2. **Indian context is the moat.** Anywhere we can show we know India specifically (₹ formatting with lakhs / crores, state names, scheme names, sector-specific tier-2 examples, MCA / DPIIT references), we should. A generic version of this site is a worse site.
3. **Editorial clarity over product flash.** Reading and scanning are the primary jobs. Motion, ornament, and "delight" are allowed only when they make scanning faster or reading more enjoyable, never when they slow either down.
4. **Trust through provenance.** Every number or claim should be timestamped or sourced where possible ("as of FY24, source: MCA AOC-4," "rate effective Apr 2026, source: SBI press release"). Make provenance feel like a design feature, not a footnote.
5. **Thumb-first, then desktop.** Mobile is the primary surface. Filters, search, scroll affordances, tap targets, and image weight all need to pass the "one hand on a phone in poor signal" test before any desktop polish is added.

## Accessibility & Inclusion

- **WCAG 2.1 AA** as the floor, AAA on text contrast where possible. Audience includes low-vision elders, especially on the funding / scheme pages that get shared inside families.
- **Reduced motion** must be respected (`prefers-reduced-motion`). No autoplay, no parallax that scrolls regardless of user setting.
- **Color cannot be the only signal.** Policy alerts, status pills, "verified" badges all need a non-color cue (icon, label, weight).
- **Bandwidth.** Many users are on Jio 4G in spotty coverage. Image weight, font-loading, and hero-section bloat are accessibility concerns, not just performance. Target: largest-contentful-paint under 2.5s on a 4G Moto G class device.
- **Language.** Default English, but the copy register accepts Hindi-origin business vocabulary (kirana, dhaba, tiffin, mandi) without italicizing or translating them, the same way an Indian publication would.
- **Form labels** must be persistent (not placeholder-as-label), and error messages must be specific ("Pincode must be 6 digits" not "Invalid input").
