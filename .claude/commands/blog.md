---
description: Generate and publish a new blog post end-to-end. Usage — /blog auto | /blog "<theme>"
argument-hint: auto | "<theme>"
---

Delegate this task to the **blog-writer** subagent. Theme: `$ARGUMENTS`.

The subagent must run the full pipeline:

1. Load the `blog-writer` skill and follow `SKILL.md` exactly.
2. Query Sanity for existing post slugs and idea slugs.
3. Pick a theme:
   - If `$ARGUMENTS` is `auto` or empty → pick an under-covered theme based on category counts.
   - Otherwise → use `$ARGUMENTS` verbatim as the theme.
4. Pick 3–6 idea slugs to backlink (must match the theme by industry/tags).
5. Draft the post in memory, then self-review against `checklist.md`. If any check fails, fix and re-review. Hard-fail (abort) if checks still fail after 2 passes.
6. Write `scripts/seed-post-<slug>.mjs` from `publish-template.mjs`. Do NOT execute it.
7. Commit the seed script on a `blog/<slug>` branch, merge into `main`, and push (follow step 9 of `SKILL.md` — handles branch switch, stash, return to original branch).
8. Return: URL (`https://businessideas.live/blog/<slug>`), theme picked, idea slugs backlinked, word count, and a one-line summary.

**Do NOT** ask the user any questions mid-flow. Make reasonable choices and proceed. If a hard blocker occurs (Sanity auth missing, git push fails), abort with a clear error message.
