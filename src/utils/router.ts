/**
 * Client-side Router and URL State Manager
 * Provides full HTML5 History API URL synchronization for all pages, posts,
 * categories, authors, search, static pages, and admin routes.
 * Supports path-based URLs (/news/:slug, /category/:slug, etc.),
 * hash-based fallback (/#/news/:slug), and query params (?news=:slug).
 */

import { AppView } from '../App';
import { StaticPageType } from '../types';

export interface ParsedRoute {
  view: AppView;
  activeSlug?: string;
  activeCategorySlug?: string;
  activeAuthorSlug?: string;
  searchQuery?: string;
  staticPageType?: StaticPageType;
}

export type AppRoute = ParsedRoute;

/**
 * Extracts route from raw path string (e.g. "/news/budget-2026", "/category/desh", "/videos")
 */
function parsePathString(rawPath: string, searchParams: URLSearchParams): ParsedRoute | null {
  if (!rawPath) return null;
  const path = rawPath.replace(/^\/+/, '').replace(/\/+$/, '');

  // 1. News Article (news/:slug or post/:slug or article/:slug)
  const newsMatch = path.match(/(?:^|\/)(?:news|post|article)\/([^/?#]+)/i);
  if (newsMatch && newsMatch[1]) {
    const slug = decodeURIComponent(newsMatch[1]).trim();
    if (slug) {
      return { view: 'article', activeSlug: slug };
    }
  }

  // 2. Category (category/:slug or cat/:slug)
  const catMatch = path.match(/(?:^|\/)(?:category|cat)\/([^/?#]+)/i);
  if (catMatch && catMatch[1]) {
    const catSlug = decodeURIComponent(catMatch[1]).trim();
    if (catSlug) {
      return { view: 'category', activeCategorySlug: catSlug };
    }
  }

  // 3. Author (author/:slug)
  const authorMatch = path.match(/(?:^|\/)(?:author|reporter)\/([^/?#]+)/i);
  if (authorMatch && authorMatch[1]) {
    const authorSlug = decodeURIComponent(authorMatch[1]).trim();
    if (authorSlug) {
      return { view: 'author', activeAuthorSlug: authorSlug };
    }
  }

  // 4. Search
  if (path === 'search' || path.startsWith('search/')) {
    const qFromPath = path.startsWith('search/')
      ? decodeURIComponent(path.replace(/^search\//, ''))
      : '';
    const q = searchParams.get('q') || searchParams.get('search') || qFromPath || '';
    return { view: 'search', searchQuery: q };
  }

  // 5. Media & Special Pages
  if (path === 'videos' || path === 'video') {
    return { view: 'videos' };
  }

  if (path === 'photos' || path === 'photo' || path === 'gallery') {
    return { view: 'photos' };
  }

  if (path === 'e-paper' || path === 'epaper' || path === 'paper') {
    return { view: 'epaper' };
  }

  // 6. Static Pages
  if (path === 'about' || path === 'about-us') {
    return { view: 'static', staticPageType: 'about' };
  }

  if (path === 'contact' || path === 'contact-us') {
    return { view: 'static', staticPageType: 'contact' };
  }

  if (path === 'privacy' || path === 'privacy-policy') {
    return { view: 'static', staticPageType: 'privacy' };
  }

  if (path === 'terms' || path === 'terms-and-conditions') {
    return { view: 'static', staticPageType: 'terms' };
  }

  if (path === 'disclaimer') {
    return { view: 'static', staticPageType: 'disclaimer' };
  }

  if (path === 'editorial-policy') {
    return { view: 'static', staticPageType: 'editorial-policy' };
  }

  if (path === 'sitemap') {
    return { view: 'sitemap' };
  }

  // 7. Admin Routes
  if (path === 'admin/login' || path === 'admin-login') {
    return { view: 'admin_login' };
  }

  if (path === 'admin' || path.startsWith('admin/')) {
    return { view: 'admin' };
  }

  return null;
}

/**
 * Parses the current window.location (pathname, hash, and search query) into route state.
 * Guaranteed to never wrongly default to homepage when a post, page, category, or parameter is present.
 */
export function parseRouteFromLocation(): ParsedRoute {
  if (typeof window === 'undefined') {
    return { view: 'home' };
  }

  const pathname = window.location.pathname || '/';
  const search = window.location.search || '';
  const hash = window.location.hash || '';
  const searchParams = new URLSearchParams(search);

  // A. Check Hash First (e.g. #/news/budget-2026 or #/category/desh)
  if (hash && hash.length > 1) {
    const rawHash = hash.replace(/^#\/?/, '/');
    const hashParams = new URLSearchParams(rawHash.includes('?') ? rawHash.split('?')[1] : '');
    const hashPath = rawHash.split('?')[0];
    const fromHash = parsePathString(hashPath, hashParams);
    if (fromHash) return fromHash;
  }

  // B. Check Pathname (e.g. /news/budget-2026 or /category/desh)
  const fromPath = parsePathString(pathname, searchParams);
  if (fromPath) return fromPath;

  // C. Check Query Parameters fallback (e.g. ?news=budget-2026, ?post=..., ?category=..., ?page=...)
  const queryNews = searchParams.get('news') || searchParams.get('post') || searchParams.get('article');
  if (queryNews) {
    return { view: 'article', activeSlug: decodeURIComponent(queryNews).trim() };
  }

  const queryCategory = searchParams.get('category') || searchParams.get('cat');
  if (queryCategory) {
    return { view: 'category', activeCategorySlug: decodeURIComponent(queryCategory).trim() };
  }

  const queryAuthor = searchParams.get('author') || searchParams.get('reporter');
  if (queryAuthor) {
    return { view: 'author', activeAuthorSlug: decodeURIComponent(queryAuthor).trim() };
  }

  const queryPage = searchParams.get('page') || searchParams.get('view');
  if (queryPage) {
    const cleanPage = queryPage.toLowerCase().trim();
    if (cleanPage === 'videos' || cleanPage === 'video') return { view: 'videos' };
    if (cleanPage === 'photos' || cleanPage === 'photo') return { view: 'photos' };
    if (cleanPage === 'epaper' || cleanPage === 'e-paper') return { view: 'epaper' };
    if (cleanPage === 'sitemap') return { view: 'sitemap' };
    if (cleanPage === 'admin') return { view: 'admin' };
    if (cleanPage === 'admin_login' || cleanPage === 'login') return { view: 'admin_login' };
    if (
      cleanPage === 'about' ||
      cleanPage === 'contact' ||
      cleanPage === 'privacy' ||
      cleanPage === 'terms' ||
      cleanPage === 'disclaimer' ||
      cleanPage === 'editorial-policy'
    ) {
      return { view: 'static', staticPageType: cleanPage as StaticPageType };
    }
  }

  const searchQuery = searchParams.get('q') || searchParams.get('search');
  if (searchQuery) {
    return { view: 'search', searchQuery: searchQuery.trim() };
  }

  // D. Standard Homepage
  return { view: 'home' };
}

/**
 * Builds the canonical URL for a given state.
 */
export function buildUrl(route: ParsedRoute): string {
  switch (route.view) {
    case 'article':
      return `/news/${encodeURIComponent(route.activeSlug || '')}`;
    case 'category':
      return `/category/${encodeURIComponent(route.activeCategorySlug || 'all')}`;
    case 'author':
      return `/author/${encodeURIComponent(route.activeAuthorSlug || '')}`;
    case 'search':
      return route.searchQuery ? `/search?q=${encodeURIComponent(route.searchQuery)}` : '/search';
    case 'videos':
      return '/videos';
    case 'photos':
      return '/photos';
    case 'epaper':
      return '/e-paper';
    case 'static':
      return `/${route.staticPageType || 'about'}`;
    case 'sitemap':
      return '/sitemap';
    case 'admin_login':
      return '/admin/login';
    case 'admin':
      return '/admin';
    case 'home':
    default:
      return '/';
  }
}

/**
 * Updates the browser URL bar using HTML5 History API pushState,
 * then dispatches a custom event to notify listeners.
 */
export function navigateToUrl(url: string, replace = false) {
  if (typeof window === 'undefined') return;

  try {
    const currentFull = window.location.pathname + window.location.search;
    if (currentFull !== url) {
      if (replace) {
        window.history.replaceState({}, '', url);
      } else {
        window.history.pushState({}, '', url);
      }
    }
  } catch (err) {
    // In sandboxed iframes where pushState might be blocked, fallback to hash
    console.warn('History pushState fallback:', err);
    try {
      window.location.hash = url;
    } catch {
      // no-op
    }
  }

  window.dispatchEvent(new CustomEvent('app_route_change', { detail: { url } }));
}
