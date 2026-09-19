// GitHub Pages serves this site from /personal-website/ (astro.config.mjs's
// `base`), so every hardcoded root-relative href/src needs that prefix.
// Astro rewrites its own generated routes automatically; it does NOT rewrite
// literal strings in our markup, hence this helper.
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  if (path === '/') return base;
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${trimmedBase}${path}`;
}
