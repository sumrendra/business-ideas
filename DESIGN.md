---
name: BusinessIdeas.live
description: An editorial knowledge platform for Indian entrepreneurs — real numbers, real founders, real funding routes.
colors:
  ink: "#16181d"
  ink-soft: "#3b3f47"
  paper: "#fbfaf8"
  surface: "#ffffff"
  surface-sunk: "#f4f2ee"
  line: "#e6e3dc"
  primary: "#4f46e5"
  primary-deep: "#4338ca"
  primary-tint: "#eef1fe"
  positive: "#1f8a55"
  caution: "#b26a00"
  alert: "#c0362c"
  ink-dark: "#0e1014"
  surface-dark: "#171a21"
  surface-dark-raised: "#1f232c"
  line-dark: "#2c313b"
  paper-dark: "#e8e8ea"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.12em"
  numeric:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
    fontFeature: "'tnum' 1, 'cv05' 1"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section: "clamp(48px, 8vw, 96px)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  chip-filter:
    backgroundColor: "{colors.surface-sunk}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  chip-filter-active:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  stat-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: BusinessIdeas.live

## 1. Overview

**Creative North Star: "The Ledger, Not the Brochure"**

This is a publication that happens to run on a database, not a SaaS app that happens to have a blog. The closest reference points are Rest of World, The Ken, and the restraint of Stratechery applied to Indian small business: an interface that reads as a credible desk reference an entrepreneur in Indore or Coimbatore returns to, not a growth-marketing funnel. Every screen earns trust by showing receipts. Revenue in ₹ crores, MCA filing years, scheme eligibility caps, and "as of FY24" provenance are the visual texture of the site, set in a tabular-figure numeric style so columns line up and a reader can scan a P&L the way they would in a newspaper business page.

The system is warm-neutral and quiet, with a single confident accent. Backgrounds are a faintly warm paper (`#fbfaf8`), never the cold blue-grey of a dashboard and never pure `#fff`. Ink is a near-black with a trace of warmth, never `#000`. One indigo accent carries interaction and brand; everything else is earned by data. The page should feel dense where numbers live and generous where prose lives, with one or two accent moments per screen rather than uniform decoration. If a screenshot could be mistaken for a JustDial directory, a Medium listicle farm, or a fintech glassmorphism dashboard, the design has failed.

This system explicitly rejects the five anti-references in PRODUCT.md: VC-Twitter SaaS hero gradients, JustDial/IndiaMart yellow-CTA directory density, Medium "8 Ideas for 2026" stock-photo listicles, fintech frosted-glass dashboards, and crypto-neon trading-floor energy. The failure mode for this specific codebase is not any of those, though: it is **accidental color noise** (fourteen accent hues used decoratively) and **a flat, ungrouped navigation** that hides two-thirds of the site. The system below exists to impose discipline on both.

**Key Characteristics:**
- Warm paper neutrals, never cold dashboard grey, never pure black or white.
- One indigo accent; all other color is semantic (positive / caution / alert), never decorative.
- Numbers are a first-class typographic element with tabular figures.
- Editorial density: tight in data, generous in prose.
- Thumb-first. Mobile navigation and tap targets pass the "one hand, 4G, poor signal" test before any desktop polish.

## 2. Colors

A warm-neutral foundation carrying a single indigo accent, with three semantic data colors that are never used decoratively.

### Primary
- **Indigo Accent** (`#4f46e5`, oklch(51% 0.21 277)): The one interactive and brand color. Links, primary buttons, active nav, focus rings, selected filter chips, section kickers. This is the established brand hue (213+ existing usages); identity preservation keeps it. Discipline, not replacement, is the fix.
- **Indigo Deep** (`#4338ca`): Hover and active depth for primary surfaces only.
- **Indigo Tint** (`#eef1fe`): The wash behind active chips, selected rows, and the rare highlighted callout. Never a full-bleed hero gradient.

### Secondary (semantic data colors — meaning required)
- **Ledger Green** (`#1f8a55`, oklch(55% 0.13 158)): Positive numbers only. Profit, YoY growth, "verified", survival rate above benchmark. Never a decorative badge color.
- **Filing Amber** (`#b26a00`): Caution and the sponsored/labeled-content cue. "Estimate", "self-reported", "Sponsored", watch-status. The single color that flags "read this with a pinch of salt."
- **Alert Red** (`#c0362c`): Policy alerts and losses/negatives only. Policy Pulse dot, profit shown in parentheses, "missed" status. Pairs with a non-color cue (icon or label) every time.

### Neutral
- **Ink** (`#16181d`): Primary text and headlines. A warm near-black, never `#000`.
- **Ink Soft** (`#3b3f47`): Body copy, secondary text, table values.
- **Paper** (`#fbfaf8`): The default page background. Warm, low-glare, kind on a mid-range phone in sunlight.
- **Surface** (`#ffffff`): Cards and raised elements that need to lift off paper.
- **Surface Sunk** (`#f4f2ee`): Inset wells, table header rows, unselected chips.
- **Line** (`#e6e3dc`): Hairline borders and dividers. Warm, low-contrast, structural.

Dark mode mirrors these on a near-black warm base (`#0e1014` page, `#171a21` surface, `#2c313b` line) with the same accent and semantic roles.

### Named Rules
**The One Voice Rule.** Indigo is the only non-semantic color on any screen, and it covers ≤10% of the surface. If a second decorative hue appears (a teal badge, a violet pill, a rose accent), delete it. The current 14-hue spread is the bug this rule exists to kill.

**The Earned Color Rule.** Green, amber, and red may appear only attached to a number, status, or provenance label whose meaning they carry. No green "just because it's a positive vibe." Color is data, not decoration.

## 3. Typography

**Display / Body / Label Font:** Inter (with `system-ui, sans-serif` fallback)
**Numeric:** Inter with tabular figures (`font-feature-settings: 'tnum' 1`)

**Character:** One committed sans, carried by weight and size contrast rather than a second family. Inter is the established face; the discipline is in the scale and in switching numbers to tabular figures so financial columns align. A magazine shape (serif display + sans body) was considered and rejected: it would push the site toward the "editorial-magazine" reflex lane, and tabular data is the actual hero here, not long-form essays.

### Hierarchy
- **Display** (800, clamp(2.25rem → 3.75rem), 1.05, -0.02em): Page heroes only. One per page.
- **Headline** (700, clamp(1.5rem → 2rem), 1.15): Section headings.
- **Title** (600, 1.0625rem, 1.3): Card titles, table captions, list-item leads.
- **Body** (400, 1rem, 1.65): Prose. Capped at 65–75ch line length.
- **Label** (700, 0.6875rem, 0.12em tracking, uppercase): The section kicker and chip text. Used sparingly (see rule).
- **Numeric** (700, 1.5rem, tabular figures): Revenue, funding, margins, counts. The page's load-bearing element.

### Named Rules
**The Tabular Number Rule.** Every figure a reader might compare down a column (revenue by year, funding by round, margins by sector) uses tabular figures and right-aligns in tables. Proportional figures in a financial table are a bug.

**The Quiet Kicker Rule.** The uppercase tracked label is a kicker, not section grammar. At most one per major section, and never stacked above every sub-heading. Repeated tiny tracked labels are AI scaffolding.

## 4. Elevation

Flat by default. Depth comes from the warm tonal stack (paper → surface-sunk → surface), hairline `line` borders, and restraint, not from shadows. This is a reading surface, not a control panel; floating cards with soft drop-shadows would push it toward the dashboard aesthetic the brand rejects.

### Shadow Vocabulary
- **Lift on intent** (`box-shadow: 0 6px 24px -8px rgba(22, 24, 29, 0.12)`): Appears only on hover for interactive cards, and on the chrome that genuinely floats (the sticky nav, the command palette, dropdown menus). Never at rest on a content card.

### Named Rules
**The Flat-At-Rest Rule.** Content cards have a border, not a shadow, until the user hovers. If a card floats while the page is still, the shadow is wrong.

## 5. Components

### Buttons
- **Shape:** Gently rounded (10px / `rounded.md`).
- **Primary:** Indigo (`#4f46e5`) on white text, 10px 18px padding. The single high-emphasis action per view.
- **Hover / Focus:** Deepen to `#4338ca`; focus shows a 2px indigo ring offset 2px. Never rely on color alone for focus.
- **Ghost / Outline:** Surface background, `line` border, ink-soft text. For secondary actions.

### Chips (filters)
- **Style:** Pill (`rounded.pill`), sunk-surface background, ink-soft text. Persistent, tappable, ≥32px high.
- **State:** Active chip uses indigo-tint background with indigo-deep text plus a check or filled dot, so selection is never color-only.

### Cards / Containers
- **Corner Style:** 16px (`rounded.lg`).
- **Background:** Surface (`#fff`) on paper; surface-raised in dark mode.
- **Shadow Strategy:** None at rest; lift-on-intent on hover (see Elevation).
- **Border:** 1px `line` hairline, always.
- **Internal Padding:** 20px (`spacing.lg`-ish). Never nest a card inside a card.

### Inputs / Fields
- **Style:** Surface background, `line` border, 10px radius. Labels are persistent and visible, never placeholder-as-label.
- **Focus:** Border shifts to indigo plus a soft indigo ring. No glow.
- **Error:** Alert-red border with a specific message ("Pincode must be 6 digits", not "Invalid input").

### Navigation
- **Style:** Sticky top bar on warm paper with a hairline base and lift-on-scroll shadow. Primary items are grouped, not a flat 8-item row.
- **Structure:** Five top-level destinations maximum. Related tools collapse into labelled dropdown groups (e.g. "Tools" opens Funding, Intelligence, Local & Regulatory clusters). The 16 orphaned tool pages must be reachable in one hover/tap from the bar.
- **States:** Default ink-soft; hover indigo on sunk-surface; active indigo text with a 2px indigo underline (not a pill), so the current section is unambiguous.
- **Mobile:** A real menu (sheet or accordion), not a horizontally-scrolling row that hides items off-screen. Tap targets ≥44px. The current scroll-row is a known failure.

### Stat Tile (signature component)
The atom of the whole site: a label, a tabular number, and a provenance line. Used on startup profiles, sector pulse, calculators, hero counts. Number is `numeric` style; provenance ("FY24 · MCA AOC-4") is amber or ink-soft micro-text directly beneath. The provenance line is mandatory wherever the number is a claim.

## 6. Do's and Don'ts

### Do:
- **Do** keep indigo (`#4f46e5`) as the only decorative color, on ≤10% of any screen.
- **Do** attach green / amber / red to a number, status, or provenance label that gives them meaning.
- **Do** set every comparable figure in tabular figures and right-align it in tables.
- **Do** show provenance ("as of FY24, source: MCA AOC-4") as a styled micro-line, treating it as a design feature.
- **Do** group navigation into ≤5 top-level destinations with labelled dropdowns; every tool reachable in one tap.
- **Do** use warm paper (`#fbfaf8`) and warm ink (`#16181d`); tint neutrals toward the brand hue.
- **Do** give content cards a hairline border and keep them flat until hover.

### Don't:
- **Don't** introduce a second decorative hue. The 14-color spread (teal, violet, rose, sky, fuchsia badges) is the exact anti-pattern to remove.
- **Don't** use `#000` or `#fff` as text or page background; both read as cold and generic.
- **Don't** ship VC-Twitter SaaS hero gradients, Stripe-purple full-bleed washes, or "supercharge your growth" energy.
- **Don't** drift toward JustDial / IndiaMart density: yellow CTAs, cramped grids, four ads per fold, instant modal popups.
- **Don't** copy Medium-style "8 Ideas for 2026" listicle layouts with stock photos and no real numbers.
- **Don't** use fintech glassmorphism: frosted gradient cards, the "Total Revenue ↑12%" hero-metric template, neon gradient borders.
- **Don't** use crypto-neon: black backgrounds with electric numbers, ticker tape.
- **Don't** float content cards with drop-shadows at rest, or nest a card inside a card.
- **Don't** rely on color alone for status; pair every semantic color with an icon or label (low-vision elders share these pages inside families).
- **Don't** leave navigation as a flat, ungrouped row that hides two-thirds of the site behind `/tools`.
