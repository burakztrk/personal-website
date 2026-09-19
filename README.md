# personal-website

Burak Ozturk's personal site — [Astro](https://astro.build) +
[NES.css](https://nostalgic-css.github.io/NES.css/).

## Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run build      # static output in dist/
npm run preview    # serve the production build locally
```

## Adding content

Pages are driven by Markdown content collections under `src/content/`:

- `src/content/blog/*.md` — a new file here is automatically a new post at
  `/blog/<filename>` and shows up in the `/blog` listing (sorted by `date`).
  Frontmatter: `title`, `date`, `tags` (array), `accent`
  (`primary`/`warning`/`success`/`error`), `excerpt` (optional), `draft`
  (optional, default `false`).
- `src/content/career/*.md` — one entry per role, shown on `/career`.
  Frontmatter: `role`, `org`, `orgUrl` (optional), `dateLabel`, `order`
  (controls sort order), `accent`.
- `src/content/info/index.md` — the single entry rendered on `/` (the INFO
  page). Frontmatter: `title`, `role`, `location`.

No code changes are needed to publish a new blog post or career entry — just
add the Markdown file.

## Adding a brand new top-level page (e.g. "PROJECTS")

Adding an entry to an *existing* collection (above) never needs code changes.
Adding a whole new section of the site does — here's the full checklist,
using a hypothetical `PROJECTS` page as the example:

1. **Define the content collection** in `src/content.config.ts`: add a
   `projects` entry to the `defineCollection({...})` calls (copy the shape of
   `career` or `blog`, whichever is closer to what you need) and add it to
   the `export const collections = { ... }` object at the bottom of the file.
2. **Add the content files**: create `src/content/projects/*.md`, one file
   per entry, with frontmatter matching the schema from step 1.
3. **Add the route(s)** under `src/pages/`:
   - `src/pages/projects/index.astro` — the listing page. Copy
     `src/pages/career/index.astro` as a starting point (a simple listing)
     or `src/pages/blog/index.astro` if you also want a detail page per
     entry.
   - If entries need their own page, also add
     `src/pages/projects/[slug].astro` — copy `src/pages/blog/[slug].astro`
     as a starting point (it already has the `getStaticPaths` + prev/next
     pattern).
   - Every page must render through `BaseLayout` (`import BaseLayout from
     '../layouts/BaseLayout.astro'`, then `<BaseLayout title="..."
     description="...">...</BaseLayout>`) — that's what wires up the header,
     nav bar, theme toggle, and page-transition system automatically. Wrap
     your content in a `<div class="panel">` with a `<span
     class="panel-title">projects/</span>` to match the look of the other
     pages.
4. **Add the nav item**: open `src/components/NavBar.astro` and add one
   entry to the `items` array, e.g.
   `{ key: 'projects', href: '/projects', label: 'PROJECTS', accent: 'is-success' }`
   (pick whichever `is-primary`/`is-warning`/`is-success`/`is-error` accent
   isn't already crowded). That's the *only* place the nav list lives —
   `src/scripts/transitions.ts` reads each link's accent back from the
   `data-accent` attribute NavBar renders, so there's nothing to keep in
   sync by hand.
5. Run `npm run dev`, click the new nav item, and check: the page renders,
   the nav button picks up its accent color when active, and the page
   transition still runs when navigating to/from it.

## Design system

Theme tokens live in `src/styles/tokens.css`. The toggle (top right of every
page) cycles `data-theme` on `<html>` through dark, light and doom, and
persists the choice in `localStorage`. The accent tokens are deliberately
identical in all three, since they have to stay equal to NES.css's own
hardcoded `is-primary`/`is-success`/`is-warning`/`is-error` colors — a theme
overrides the neutrals only. Typography: `Press Start 2P` for UI chrome/headings,
`DotGothic16` for body copy. The page-to-page navigation animation is a
hand-rolled [View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions/)
controller in `src/scripts/transitions.ts` + `src/styles/transitions.css` —
every page still works as a standalone full load (no JS required).

The face in the middle of the nav bar is the Doom status face
(`src/components/DoomFace.astro`), sat in a recessed panel between the two
halves of the nav so the row reads like Doom's own status bar. It is not a
set of GIF files — it is a
single 7x6 sprite sheet (`public/images/doom-face/burak-doom-faces.png`, rows
0-4 are Doom health tiers, row 5 holds the dead and godmode faces) that the
component animates at runtime by stepping `background-position`. It picks one
of the canned animations (idle look-around, rampage, evil grin, death,
godmode) and, for the tier-based ones, a random amount of damage. That pick is
re-rolled on a full page load and again on every soft navigation, which the
transition controller announces via the `soft-nav` event — the header is
outside `main`, so a page swap otherwise leaves it untouched.

## Deploy

Not yet configured — to be decided (GitHub Pages vs. self-hosted).
