---
description: Unpublish (delete) an auto-generated blog post by slug. Usage — /blog-rollback <slug>
argument-hint: <slug>
---

Slug to roll back: `$ARGUMENTS`

Steps:

1. Confirm a post with this slug exists in Sanity:
   ```bash
   node -e "
     import('@sanity/client').then(async ({ createClient }) => {
       const { readFileSync } = await import('fs');
       const { join } = await import('path');
       const cfg = JSON.parse(readFileSync(join(process.env.HOME, '.config/sanity/config.json'), 'utf8'));
       const c = createClient({ projectId: '5p3rso81', dataset: 'production', apiVersion: '2024-01-01', token: cfg.authToken, useCdn: false });
       const doc = await c.fetch('*[_type==\"post\" && slug.current==\$slug][0]{_id, title}', { slug: '$ARGUMENTS' });
       console.log(JSON.stringify(doc));
     });
   "
   ```
2. If the post exists, delete it:
   ```bash
   node -e "
     import('@sanity/client').then(async ({ createClient }) => {
       const { readFileSync } = await import('fs');
       const { join } = await import('path');
       const cfg = JSON.parse(readFileSync(join(process.env.HOME, '.config/sanity/config.json'), 'utf8'));
       const c = createClient({ projectId: '5p3rso81', dataset: 'production', apiVersion: '2024-01-01', token: cfg.authToken, useCdn: false });
       await c.delete({ query: '*[_type==\"post\" && slug.current==\$slug]', params: { slug: '$ARGUMENTS' } });
       console.log('Deleted post:', '$ARGUMENTS');
     });
   "
   ```
3. Remove the seed file and commit:
   ```bash
   git rm scripts/seed-post-$ARGUMENTS.mjs 2>/dev/null || true
   git commit -m "blog: rollback $ARGUMENTS [skip ci]" --allow-empty
   git push
   ```
4. Report: deleted post title, removed seed file path (if any), confirm webhook will purge the cache.
