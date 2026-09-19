// Hand-rolled page transitions using the native View Transitions API.
// Not Astro's built-in <ClientRouter /> — that router's own transition
// directives don't map cleanly onto this project's specific multi-phase
// steps() timeline (see src/styles/transitions.css), so this controller
// talks to document.startViewTransition() directly.
//
// Every navigated page must still work standalone via a full page load
// (direct URL, refresh, no-JS): this script only intercepts clicks to add
// the animation on top of otherwise-real navigation, it never replaces it.

// Every tone a nav badge can wear: its accent when active, dark otherwise.
const BADGE_TONES = ['is-primary', 'is-warning', 'is-success', 'is-error', 'is-dark'];

/** Fired on document once a soft navigation has finished swapping the page. */
export const SOFT_NAV_EVENT = 'soft-nav';

function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

function isInternalNavigableLink(link: HTMLAnchorElement): boolean {
  if (link.origin !== window.location.origin) return false;
  if (link.target && link.target !== '_self') return false;
  if (link.hasAttribute('download')) return false;
  const protocol = link.protocol;
  if (protocol !== 'http:' && protocol !== 'https:') return false;
  return true;
}

function isSamePageAnchor(link: HTMLAnchorElement): boolean {
  return link.pathname === window.location.pathname && link.hash !== '';
}

interface FetchedPage {
  mainHTML: string;
  title: string;
  styles: string[];
}

async function fetchMainContent(url: string): Promise<FetchedPage | null> {
  try {
    const res = await fetch(url, { headers: { 'X-Soft-Nav': '1' } });
    if (!res.ok) return null;
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const main = doc.querySelector('main.page');
    if (!main) return null;
    // Astro's per-page scoped <style> tags (global.css/transitions.css
    // plus every component used on that page) live in <head>, not <main>
    // — a soft nav that only swaps <main> would silently drop them.
    const styles = Array.from(doc.head.querySelectorAll('style')).map((el) => el.textContent ?? '');
    return { mainHTML: main.innerHTML, title: doc.title, styles };
  } catch {
    return null;
  }
}

function replacePageStyles(styles: string[]): void {
  document.head.querySelectorAll('style').forEach((el) => el.remove());
  for (const css of styles) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
}

function updateNavActiveState(pathname: string): void {
  document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((link) => {
    const href = link.getAttribute('href') ?? '';
    const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

    // nes.css paints the badge's inner <span>, not the <a> — the accent has
    // to land there or the active state silently stops updating.
    const label = link.querySelector('span');
    if (label) {
      label.classList.remove(...BADGE_TONES);
      label.classList.add((active && link.dataset.accent) || 'is-dark');
    }

    if (active) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

async function performNavigation(url: string, direction: 'forward' | 'back'): Promise<void> {
  const page = await fetchMainContent(url);
  if (!page) {
    // Fetch failed (offline, non-2xx, unexpected markup) — fall back to a
    // real navigation rather than leaving the user stuck on a dead link.
    window.location.href = url;
    return;
  }

  const main = document.querySelector('main.page');
  if (!main) {
    window.location.href = url;
    return;
  }

  const applyContent = () => {
    replacePageStyles(page.styles);
    main.innerHTML = page.mainHTML;
    document.title = page.title;
    updateNavActiveState(new URL(url, window.location.href).pathname);
    window.scrollTo(0, 0);
  };

  document.documentElement.dataset.transitionDirection = direction;

  if (supportsViewTransitions()) {
    const transition = document.startViewTransition(applyContent);
    try {
      await transition.finished;
    } catch {
      // ignore — a skipped/interrupted transition still left the DOM updated
    }
  } else {
    applyContent();
  }

  // Chrome outside <main> never gets re-rendered by a soft nav, so anything
  // living there that wants to react to navigation (the header's Doom face)
  // has no other signal that the page changed.
  document.dispatchEvent(new CustomEvent(SOFT_NAV_EVENT));
}

function onClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const target = event.target;
  if (!(target instanceof Element)) return;
  const link = target.closest('a');
  if (!link) return;
  if (!isInternalNavigableLink(link)) return;
  if (isSamePageAnchor(link)) return;

  const url = link.href;
  if (url === window.location.href) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  history.pushState({}, '', url);
  void performNavigation(url, 'forward');
}

function onPopState(): void {
  void performNavigation(window.location.href, 'back');
}

export function initPageTransitions(): void {
  document.addEventListener('click', onClick);
  window.addEventListener('popstate', onPopState);
}
