/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feed. Base: cards (custom, config-driven).
 * Source: https://www.pfizerforall.com/education/
 * Selector: #main > div.section.card-grid-container .card-grid.block.dynamic-article
 * Generated: 2026-10-13
 *
 * Output (blocks/cards-feed/cards-feed.js, read with readConfigRow):
 *   source        | /education/article-index.json
 *   paths         | <ul> of article globs        (source `article-urls` row)
 *   visible       | 9                            (source `card-visible` row)
 *   insert at N   | icon <img>, h3, paragraph(s), bold CTA link   (source `card(insert-at-N)` rows)
 *   The "Explore all" heading (.card-grid-content-container) is emitted as default
 *   content before the block.
 *
 * The article tiles in the live DOM (div.card.has-image, 63 of them) are rendered
 * client-side from an index, so they are NOT migrated: the block rebuilds them from
 * `source`. The authored config is read from the page's EDS source markup (same-origin
 * .plain.html, as quiz-choice.js does). If that cannot be read, the DOM fallback uses:
 *   .card-grid-content-container h2                       (intro heading)
 *   .cards-grid-container > .card:not(.hidden-card)       (count -> visible)
 *   .cards-grid-container > .card:not(.has-image)         (promo; 1-based index -> insert at N)
 *     .card-icon span.icon.icon-{name}, .card-headline-container h3,
 *     .card-body-container p, .card-label-container p, .button-container a
 *   .card a.card-link[href] /{seg}/education/...          (-> /{seg}/education/* globs)
 *
 * Source icons are sprite names with no file in this repo's /icons, so they are emitted
 * as <img> of the site's served file. The site's icon loader strips an `asset-` prefix
 * (icon-asset-pill-bottle -> /assets/icons/pill-bottle.svg). The query string keeps
 * helix-importer from rewriting the .svg src to :icon: notation.
 */
const ORIGIN = 'https://www.pfizerforall.com';
const ARTICLE_INDEX = '/education/article-index.json';

let plainCache;
/** Synchronously load the page's EDS .plain.html (same origin) once. */
function loadPlain(params) {
  if (plainCache !== undefined) return plainCache;
  plainCache = null;
  const bases = [];
  try { if (/^https?:/.test(window.location.href)) bases.push(window.location.href); } catch (e) { /* no window */ }
  if (params && params.originalURL) bases.push(params.originalURL);
  const tried = new Set();
  for (const base of bases) {
    let u;
    try { u = new URL(base); } catch (e) { continue; }
    const p = u.pathname.replace(/\.html?$/, '');
    const candidates = p.endsWith('/') ? [`${p}index.plain.html`] : [`${p}.plain.html`, `${p}/index.plain.html`];
    for (const c of candidates) {
      const href = `${u.origin}${c}`;
      if (tried.has(href)) continue;
      tried.add(href);
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', href, false);
        xhr.send();
        if (xhr.status === 200 && /<div/.test(xhr.responseText)) {
          plainCache = new DOMParser().parseFromString(xhr.responseText, 'text/html');
          return plainCache;
        }
      } catch (e) { /* try next */ }
    }
  }
  return plainCache;
}

const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

/** Authored rows of an EDS block as [{ key, value }] (keys lower-cased, order kept). */
function readRows(blockEl) {
  return [...blockEl.children].map((row) => {
    const [k, v] = [...row.children];
    return k && v ? { key: clean(k.textContent).toLowerCase(), value: v } : null;
  }).filter(Boolean);
}

/** This block's authored rows: the n-th `card-grid.dynamic-article` in the .plain.html. */
function authoredRows(element, params) {
  const plain = loadPlain(params);
  if (!plain) return null;
  const blocks = [...plain.querySelectorAll('div.card-grid.dynamic-article')];
  if (!blocks.length) return null;
  const live = [...element.ownerDocument.querySelectorAll('.card-grid.block.dynamic-article')];
  const idx = Math.max(live.indexOf(element), 0);
  return readRows(blocks[idx] || blocks[0]);
}

function iconImg(name, document) {
  const img = document.createElement('img');
  img.src = `${ORIGIN}/assets/icons/${name.replace(/^icon-/, '').replace(/^asset-/, '')}.svg?format=svg`;
  img.alt = '';
  return img;
}

function iconName(el) {
  const cls = el && [...el.classList].find((c) => c.startsWith('icon-'));
  return cls ? cls.slice(5) : '';
}

function list(values, document) {
  const ul = document.createElement('ul');
  values.forEach((v) => {
    const li = document.createElement('li');
    li.textContent = v;
    ul.append(li);
  });
  return ul;
}

/** Copy an authored promo cell: icons -> <img>, headings without ids / bold wrappers. */
function importPromo(cell, document) {
  const out = [];
  [...cell.children].forEach((el) => {
    const node = document.importNode(el, true);
    node.querySelectorAll('span.icon').forEach((span) => {
      const name = iconName(span);
      if (name) span.replaceWith(iconImg(name, document));
      else span.remove();
    });
    if (/^H[1-6]$/.test(node.tagName)) {
      node.removeAttribute('id');
      node.querySelectorAll('strong, b').forEach((s) => s.replaceWith(...s.childNodes));
    }
    if (clean(node.textContent) || node.querySelector('img')) out.push(node);
  });
  return out;
}

/** DOM fallback for one rendered promo card. */
function domPromo(card, document) {
  const out = [];
  const name = iconName(card.querySelector('.card-icon span.icon'));
  if (name) {
    const p = document.createElement('p');
    p.append(iconImg(name, document));
    out.push(p);
  }
  const heading = card.querySelector('.card-headline-container h3, .card-headline-container h2, .card-headline-container h4');
  if (heading) {
    const h3 = document.createElement('h3');
    h3.textContent = clean(heading.textContent);
    out.push(h3);
  }
  card.querySelectorAll('.card-body-container p').forEach((src) => {
    const p = document.createElement('p');
    p.textContent = clean(src.textContent);
    out.push(p);
  });
  card.querySelectorAll('.card-label-container p').forEach((src) => {
    const p = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = clean(src.textContent);
    p.append(em);
    out.push(p);
  });
  const cta = card.querySelector('.button-container a[href]');
  if (cta) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = clean(cta.textContent);
    strong.append(a);
    p.append(strong);
    out.push(p);
  }
  return out;
}

export default function parse(element, { document, params }) {
  // intro heading -> default content before the block
  const intro = [...element.querySelectorAll('.card-grid-content-container .card-grid-content-eyebrow-container p, .card-grid-content-container h2, .card-grid-content-container .card-grid-content-body-container p')];

  const cells = [['source', ARTICLE_INDEX]];
  let paths = [];
  let visible = '';
  const promos = [];

  const rows = authoredRows(element, params);
  if (rows) {
    rows.forEach(({ key, value }) => {
      const insert = key.match(/^card\s*\(\s*insert-at-(\d+)\s*\)$/);
      if (key === 'article-urls' || key === 'paths') {
        const items = [...value.querySelectorAll('li')].map((li) => clean(li.textContent));
        paths = items.length ? items : clean(value.textContent).split(/[\s,]+/).filter(Boolean);
      } else if (key === 'card-visible' || key === 'visible') {
        visible = clean(value.textContent);
      } else if (insert) {
        promos.push({ position: parseInt(insert[1], 10), content: importPromo(value, document) });
      } else if (key === 'content' && !intro.length) {
        value.querySelectorAll('h1, h2, h3').forEach((h) => {
          const node = document.importNode(h, true);
          node.removeAttribute('id');
          intro.push(node);
        });
      }
    });
  }

  // DOM fallback: whatever the authored config did not provide
  const cards = [...element.querySelectorAll('.cards-grid-container > .card')];
  if (!rows || !visible) {
    const shown = cards.filter((c) => !c.classList.contains('hidden-card')).length;
    if (shown && shown < cards.length) visible = String(shown);
  }
  if (!rows || !promos.length) {
    cards.forEach((card, i) => {
      if (card.classList.contains('has-image') || !card.querySelector('.card-inserted, .card-icon')) return;
      promos.push({ position: i + 1, content: domPromo(card, document) });
    });
  }
  if (!rows || !paths.length) {
    const globs = [];
    cards.forEach((card) => {
      const href = (card.querySelector('a.card-link[href]') || {}).getAttribute?.('href') || '';
      const m = href.match(/^\/([^/]+)\/education\//);
      if (m && card.classList.contains('has-image')) {
        const glob = `/${m[1]}/education/*`;
        if (!globs.includes(glob)) globs.push(glob);
      }
    });
    paths = globs;
  }

  if (paths.length) cells.push(['paths', list(paths, document)]);
  if (visible) cells.push(['visible', visible]);
  promos.sort((a, b) => a.position - b.position).forEach(({ position, content }) => {
    if (content.length) cells.push([`insert at ${position}`, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feed', cells });
  if (intro.length) element.before(...intro);
  element.replaceWith(block);
}
