/**
 * Article index helpers shared by data-driven article blocks
 * (carousel-condition `articles`, cards-feed).
 *
 * Data source: any EDS JSON sheet shaped like
 * `{ total, data: [{ path, title, image, imageAlt, readingTime, badges, contentBadges,
 *   recommended, priority, publishedDate, updatedDate, id }] }`.
 * Defaults to the site query index. `path` / `image` may be relative (query index)
 * or absolute URLs (interim sheet pointing at the source site); both are supported.
 */
import { createOptimizedPicture, toClassName } from './aem.js';
import { fetchQueryIndexAll } from './shared.js';

/** Articles updated within this many days get the "Updated" badge. */
export const UPDATED_WINDOW_DAYS = 45;

const PAGE_SIZE = 500;
const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };
const DAY_MS = 86400000;
const cache = new Map();

function toPlaceholderKey(value) {
  return String(value).toLowerCase().replace(/[^0-9a-z]+(.)/g, (m, c) => c.toUpperCase());
}

/**
 * Text values of a config cell: list items, paragraphs, or newline/comma separated text.
 * @param {Element} cell
 * @returns {string[]}
 */
function cellValues(cell) {
  const items = [...cell.querySelectorAll('li')];
  if (items.length) return items.map((li) => li.textContent.trim()).filter(Boolean);
  const ps = [...cell.querySelectorAll('p')];
  const raw = ps.length ? ps.map((p) => p.textContent) : [cell.textContent];
  return raw.flatMap((t) => t.split(/[\n,]/)).map((t) => t.trim()).filter(Boolean);
}

/**
 * Read a 2-cell config row.
 * @param {Element} row
 * @returns {{ key: string, cell: Element, values: string[], href: string } | null}
 */
export function readConfigRow(row) {
  const [keyCell, cell] = [...row.children];
  if (!keyCell || !cell) return null;
  const key = toClassName(keyCell.textContent);
  if (!key) return null;
  const link = cell.querySelector('a[href]');
  return {
    key,
    cell,
    values: cellValues(cell),
    href: link ? link.getAttribute('href') : '',
  };
}

/**
 * Parse an integer config value; falls back when missing / invalid.
 * @param {string[]} values
 * @param {number} fallback
 */
export function toPositiveInt(values, fallback) {
  const n = parseInt(values?.[0], 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function fetchSheetAll(source) {
  const fetchPage = async (offset, acc) => {
    const url = new URL(source, window.location.href);
    url.searchParams.set('offset', offset);
    url.searchParams.set('limit', PAGE_SIZE);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Article index request failed: ${resp.status}`);
    const json = await resp.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    const next = [...acc, ...rows];
    const total = Number(json?.total) || 0;
    return rows.length === PAGE_SIZE && next.length < total ? fetchPage(offset + rows.length, next) : next;
  };
  return fetchPage(0, []);
}

/**
 * Fetch all article rows (cached per source for the page view).
 * @param {string} [source] JSON URL; empty = site query index
 * @returns {Promise<object[]>}
 */
export function fetchArticles(source = '') {
  const key = source || 'query-index';
  if (!cache.has(key)) {
    const promise = (source ? fetchSheetAll(source) : fetchQueryIndexAll())
      .catch((e) => {
        cache.delete(key);
        throw e;
      });
    cache.set(key, promise);
  }
  return cache.get(key);
}

/**
 * Pathname of an article path (relative or absolute), without trailing slash.
 * @param {string} path
 */
export function articlePathname(path) {
  try {
    return new URL(path, window.location.origin).pathname.replace(/\/+$/, '') || '/';
  } catch {
    return '';
  }
}

function globToRegExp(glob) {
  const normalized = articlePathname(glob.trim());
  const pattern = normalized
    .split(/(\*\*|\*)/)
    .map((part) => {
      if (part === '**') return '.*';
      if (part === '*') return '[^/]*';
      return part.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
  return new RegExp(`^${pattern}$`);
}

/**
 * Parse a date: ISO string, Excel serial number, unix seconds or milliseconds.
 * @param {string|number} value
 * @returns {number} timestamp (0 when missing / invalid)
 */
export function parseArticleDate(value) {
  if (value === undefined || value === null || value === '') return 0;
  const str = String(value).trim();
  if (/^\d+(\.\d+)?$/.test(str)) {
    const n = Number(str);
    if (n < 100000) return Math.round((n - 25569) * DAY_MS); // Excel serial (1900 system)
    return n < 1e12 ? n * 1000 : n;
  }
  const parsed = Date.parse(str);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isTruthy(value) {
  return /^(true|yes|y|x|1)$/i.test(String(value ?? '').trim());
}

/**
 * Filter by path globs (compared against the URL pathname), then sort by
 * publishedDate desc, priority High > Medium > Low, title.
 * Without globs, rows that carry an `id` are kept (all rows when none has one).
 * @param {object[]} rows
 * @param {string[]} [globs]
 * @returns {object[]}
 */
export function selectArticles(rows, globs = []) {
  const valid = rows.filter((row) => row?.path && row?.title);
  let selected;
  if (globs.length) {
    const patterns = globs.map(globToRegExp);
    selected = valid.filter((row) => {
      const pathname = articlePathname(row.path);
      return patterns.some((re) => re.test(pathname));
    });
  } else {
    selected = valid.some((row) => row.id) ? valid.filter((row) => row.id) : valid;
  }

  const seen = new Set();
  return selected
    .filter((row) => {
      const p = articlePathname(row.path);
      if (seen.has(p)) return false;
      seen.add(p);
      return true;
    })
    .map((row) => ({ row, published: parseArticleDate(row.publishedDate || row.date) }))
    .sort((a, b) => (b.published - a.published)
      || ((PRIORITY_RANK[String(b.row.priority).toLowerCase()] || 0)
        - (PRIORITY_RANK[String(a.row.priority).toLowerCase()] || 0))
      || String(a.row.title).localeCompare(String(b.row.title)))
    .map(({ row }) => row);
}

/**
 * Card badges, at most `max`: status (Recommended, else Updated within the window),
 * then the indication badge(s), then content badge(s).
 * Labels are looked up in the placeholders (camelCased value) with the value as fallback.
 * @param {object} row
 * @param {Record<string, string>} ph placeholders
 * @param {number} [max]
 * @returns {{ label: string, type: 'recommended'|'updated'|'indication'|'content' }[]}
 */
export function getArticleBadges(row, ph = {}, max = 2) {
  const badges = [];
  if (isTruthy(row.recommended)) {
    badges.push({ label: ph.recommended || 'Recommended', type: 'recommended' });
  } else {
    const updated = parseArticleDate(row.updatedDate || row.publishedDate);
    if (updated && Date.now() - updated <= UPDATED_WINDOW_DAYS * DAY_MS) {
      badges.push({ label: ph.updated || 'Updated', type: 'updated' });
    }
  }
  const split = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
  split(row.badges).forEach((label) => badges.push({ label, type: 'indication' }));
  split(row.contentBadges).forEach((label) => badges.push({ label, type: 'content' }));
  return badges.slice(0, max).map((b) => ({
    ...b,
    label: (b.type === 'indication' || b.type === 'content') ? (ph[toPlaceholderKey(b.label)] || b.label) : b.label,
  }));
}

/**
 * Picture for an article image. Same-origin paths go through createOptimizedPicture;
 * external URLs render a plain picture (width-sized sources when the URL takes `?width=`).
 * @param {string} src
 * @param {string} alt
 * @param {boolean} eager
 * @param {{ media?: string, width: string }[]} breakpoints
 * @returns {HTMLPictureElement|null}
 */
export function createArticlePicture(src, alt = '', eager = false, breakpoints = [{ width: '750' }]) {
  if (!src) return null;
  let url;
  try {
    url = new URL(src, window.location.href);
  } catch {
    return null;
  }
  if (url.origin === window.location.origin) {
    return createOptimizedPicture(url.pathname, alt, eager, breakpoints);
  }

  const sized = (width) => {
    if (!url.searchParams.has('width')) return url.href;
    const u = new URL(url.href);
    u.searchParams.set('width', width);
    return u.href;
  };
  const picture = document.createElement('picture');
  breakpoints.slice(0, -1).forEach((br) => {
    if (!url.searchParams.has('width')) return;
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('srcset', sized(br.width));
    picture.append(source);
  });
  const img = document.createElement('img');
  img.setAttribute('src', sized(breakpoints[breakpoints.length - 1].width));
  img.setAttribute('alt', alt);
  img.setAttribute('loading', eager ? 'eager' : 'lazy');
  img.setAttribute('decoding', 'async');
  picture.append(img);
  return picture;
}
