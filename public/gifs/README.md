# gifs

Drop `.gif`, `.webp`, `.png`, or `.jpg` files here.

The header's avatar slot picks one at random on page load and displays it
in place of the "GIF SOON" placeholder. If this folder has no image files
in it, the placeholder is shown instead — nothing breaks either way.

This folder is scanned at build/request time (`src/components/SiteHeader.astro`),
so in `npm run dev` a newly added file shows up on refresh; a production
build (`npm run build`) needs to be re-run to pick up new files.

Only add images you have the rights to use — this repo is public.
