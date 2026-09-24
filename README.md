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

The site is a 1993 Doom status bar running on NES-era pixel UI: square
pixels, stepped motion, chunky borders, pastel HUD colours. Every value below
comes from `src/styles/tokens.css`, `src/styles/global.css` and the scoped
styles of the components; use the tokens, never ad-hoc values.

### Page anatomy

Every page renders through `BaseLayout.astro`, which gives it the same shell:

1. **Header** (`SiteHeader.astro`): the `ozturk.ai` wordmark left, the pixel
   theme toggle right.
2. **One `.panel`** inside `main.page`, holding all content, with a
   `.panel-title` written like a lowercase file path (`info.about`, `blog/`,
   `apps/app-fastcurrency`, `blog/self-hosted-writefreely.md`).
3. **Nav bar** (`NavBar.astro`), docked fixed to the bottom of the viewport:
   nav badges either side of the animated Doom face, which is the Home link.

Inside the panel the order is always: back link (detail pages only) → `h1` →
meta or tags → content blocks under `h2` section headings → divider-row lists
or feature cards. No second panel, no sidebar, no hero outside the panel, no
footer: the nav bar is the footer.

### Themes

The toggle cycles `data-theme` on `<html>` through **dark → light → doom**
and persists the choice in `localStorage('theme')`. An inline script in
`BaseLayout.astro` sets it before first paint; a first visit gets **doom**.
Themes change only the neutrals and the wordmark gradient. The accents are
the same in all three so badges keep reading like HUD indicators.

| Token | doom (default) | dark | light | Used for |
| --- | --- | --- | --- | --- |
| `--ground` | `#14100e` | `#12141a` | `#f7f7f2` | Page background; the notch behind a panel title |
| `--surface` | `#2a2421` | `#212529` | `#ffffff` | Panel fill; hover fill of action-tags and the toggle |
| `--raised` | `#3a312c` | `#2c3138` | `#edede8` | Anything on the panel: nav bar, cards, icons, action-tags, toggle |
| `--ink` | `#e8dcc6` | `#f7f7f2` | `#12141a` | All primary text and headings |
| `--ink-dim` | `#a08e76` | `#aeb6bf` | `#5a626b` | Dates, role line, taglines, panel titles, back links |
| `--line` | `#7a4a33` | `#4a515a` | `#21252b` | Every edge: borders, dashed dividers, wordmark bevel |
| `--brand-top` | `#6f93c4` | `#93a4c0` | `#5b6f8c` | Wordmark gradient, top (HUD steel) |
| `--brand-bottom` | `#e0a542` | `#cc9a66` | `#a8743f` | Wordmark gradient, bottom (molten gold) |

Fixed across themes:

| Token | Value | Used for |
| --- | --- | --- |
| `--primary` | `#93a4c0` | Links, APPS nav accent, CI/CD tag, avatar focus ring, action-tag hover border |
| `--warning` | `#cc9a66` | Interaction colour: hover on titles and back links, BLOG nav accent, date badges, **the focus outline** |
| `--success` | `#a9bf93` | ANDROID tag, `is-success` buttons and badges |
| `--error` | `#c98a7d` | HOMELAB tag, `is-error`; a Doom pastel, not an alarm red |
| `--accent-ink` | `#1f1913` | Text on every pastel fill (white fails contrast on all of them) |
| `--screen` | `#12141a` | The dark well behind the Doom face |
| `--capsule-top` / `--capsule-base` | `#f2f0e4` / `#e05a47` | Reserved, not used by any page yet |
| `#cbb089`, `#ddd2b8` | literals | COMPOSE (khaki) and PROXMOX (bone) tags only |

Rules:

- Three surface steps only: `ground` → `surface` → `raised`.
- Text on a pastel fill is always `--accent-ink`.
- `--warning` means "you can interact with this": hover colour, and the
  keyboard focus outline (`3px solid`, `outline-offset: 3px`) on every
  focusable element.
- Known contrast gaps, kept as they are: `--primary` / `--warning` as text on
  light-theme surfaces are about 2.5:1, and `--ink-dim` on `--raised` in doom
  is 4.0:1. Prefer `--ink` for small text in those spots.

### Typography

Pixel faces only, never a smooth sans:

| Role | Face | Sizes |
| --- | --- | --- |
| Wordmark | `AmazDoomLeft` (self-hosted, `public/fonts/`) | 60px (44px at ≤420px), `ozturk.ai` only |
| Display: headings and UI chrome | `Press Start 2P` (`--font-display`) | `h1` 22px, `h2` 14px, `h3` 12px, panel titles / action-tags / nav 10px, tags / back links 9px, HOME caption 8px; line-height 1.6 |
| Body | `DotGothic16` (`--font-body`) | 19px / 1.8 body, 17px role line, 16px card text and career dates, 15px meta (post dates, taglines) |
| Code | `--font-mono` system stack | 15px in code blocks (Shiki `github-dark`) |

- The wordmark is live text: a vertical `--brand-top` → `--brand-bottom`
  gradient clipped to the glyphs, with `drop-shadow(3px 3px 0 var(--line))`
  as the bevel. It re-colours when the theme changes; never replace it with
  an image.
- Press Start 2P is wide: keep display text to a few words.
- AmazDoomLeft by Amazingmax is CC BY-NC 3.0 (non-commercial, attribution in
  `global.css`). Do not use it in commercial material.

### Voice and copy

- English, first person, plain and technical. No marketing adjectives, no
  exclamation marks.
- **UPPERCASE** for UI chrome: listing `h1`s (`BLOG`, `APPS`), section `h2`s
  (`WORK`, `CONTACT`, `WHAT IT DOES`), nav labels, skill tags.
- **lowercase** for panel titles and the wordmark.
- **Sentence case** for links and actions (`Mail me →`, `← Blog`) and feature
  card titles.
- Dates: career `Sep 2023 -- Present`, posts `MM/YYYY`.
- Blog posts are build logs: a one-line summary, a **Stack:** list, then
  numbered `h2` steps (`## 1. Goal`).
- Emoji only on app pages (feature cards and fact tags).

### Spacing, borders, radius, elevation

- 4px grid: `--space-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 20 · `-6` 24 ·
  `-8` 32 · `-10` 40 · `-12` 48. Page gutter `--space-4`, panel padding
  `--space-8`, gap between page blocks `--space-6`. Content caps at 1040px.
- Borders are part of the look: **4px** panels, nav bar, avatar, screenshot
  frames, code blocks; **3px** action-tags, small app icons, nav-face
  dividers; **2px** feature cards, tag-badges, dashed `.divider-row` rules.
- Radius: `4px` on framed things, `0` on NES buttons and badges (the pixel
  border draws the corners), `999px` on action-tags only.
- No soft shadows. The only elevation is the nav bar's stamped-metal lip
  (`inset 0 2px 0 rgb(255 255 255 / 7%), inset 0 -3px 0 rgb(0 0 0 / 28%), 0 6px 16px rgb(0 0 0 / 45%)`).
  Tags get their stepped corners from hard offset box-shadows.
- Breakpoints: 680px (nav groups stack, page bottom padding 100px → 140px),
  560px (feature grid to one column, app hero stacks), 420px (wordmark 44px).

### Components and classes

| Pattern | Markup | Notes |
| --- | --- | --- |
| Panel | `.panel` + `.panel-title` | One per page. Replaces NES.css `.nes-container.with-title`, whose colours ignore the tokens |
| Divider row | `.divider-row` | The only list pattern: career (`.role-date` + role), posts (`.post-title` + `.post-date`), apps (`.app-link` with `.app-icon`, `.app-name`, `.app-tagline`). Last row has no rule |
| Skill / fact tag | `<span class="tag" style="--tag: var(--success)">` | Tone via `--tag`: `--primary`, `--warning`, `--success`, `--error`, `#cbb089`, `#ddd2b8`. Static, never a link |
| Post topic | `.tag-badge` in `.meta-row` | `--raised` fill, 2px `--line` border, `--ink-dim` text; follows the date badge |
| NES badge | `.nes-badge > span.is-*` | Nav items (inactive `is-dark`, active = the item's accent) and post dates (`accent` frontmatter) |
| Action tag | `a.action-tag` + `<span class="arrow">→</span>` | Outbound actions (Mail me, LinkedIn, GitHub, Privacy Policy). `.is-soon` = 60% opacity, no arrow |
| NES button | `.nes-btn` | Blog prev/next pagination (`◄` / `►`) and the theme toggle (retinted to `--raised`) |
| Back link | `a.back-nav` | `← Blog`, `← Apps`; first thing in a detail panel |
| Feature card | `.feature-grid > .feature-card` | Emoji, `h3`, one dim sentence; two-up, even count |
| App hero | `.app-hero`, `.screenshot-gallery > .screenshot-frame` | 80px icon, capitalised `h1`, tagline ≤46ch, sideways-scrolling 160px screenshot frames |
| Post body | `.body-copy.post-body` | Rendered Markdown: framed code blocks, `--line` ruled blockquotes |

NES.css hardcodes its own `is-primary` / `is-success` / `is-warning` /
`is-error` colours. `global.css` overrides every rule that names them,
including the pixel-shading `::after` and the badge's plus-shaped
box-shadow, so both always come from the tokens above. Keep that override
block when upgrading NES.css.

### Motion

- Every animation uses `steps()` timing; nothing eases. That is what makes it
  read as hardware.
- Page changes: a GameBoy-style transition through the View Transitions API
  (`src/scripts/transitions.ts` + `src/styles/transitions.css`): the old page
  flashes, settles to sepia, closes like blinds, blacks out, and the new page
  opens in a circle (620ms). Going back runs a shorter close. Every page still
  works as a standalone full load with no JS.
- The info avatar (`avatar-frames.webp`, six frames, the sixth is god mode on
  click) swaps every 2s with the same flash → blinds → reveal sequence.
- Hover is a 2px lift on action-tags only; elsewhere hover changes colour to
  `--warning`.
- `prefers-reduced-motion`: transitions become 120ms fades, the avatar swaps
  instantly, the Doom face holds one frame.

### The Doom face

The face in the middle of the nav bar is the Doom status face
(`src/components/DoomFace.astro`), sat in a recessed `--screen` panel between
the two halves of the nav so the row reads like Doom's own status bar. It is
not a set of GIF files: it is a single 7×6 sprite sheet
(`public/images/doom-face/burak-doom-faces.png`; columns grin, smile, rage,
scream, ahead, left, right; rows 0-4 are health tiers, row 5 holds the dead
and godmode faces) that the component animates at runtime by stepping
`background-position`. It picks one of the canned animations (idle
look-around, rampage, evil grin, death, godmode) and, for the tier-based
ones, a random amount of damage. That pick is re-rolled on a full page load
and again on every soft navigation, which the transition controller announces
via the `soft-nav` event — the header is outside `main`, so a page swap
otherwise leaves it untouched.

### Icons and imagery

- No icon font. Icons are 8×8 bitmaps emitted as one `<rect>` per lit pixel
  (the sun, moon and skull in `ThemeToggle.astro`), rendered with
  `shape-rendering: crispEdges`. Draw new icons the same way.
- Arrows are text glyphs: `→`, `←`, `◄`, `►`.
- Pixel art always gets `image-rendering: pixelated`.
- App assets live at `public/images/apps/<slug>/icon.webp` and
  `screenshots/<n>.webp`.

## Deploy

Not yet configured — to be decided (GitHub Pages vs. self-hosted).
