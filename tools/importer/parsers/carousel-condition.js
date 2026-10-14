/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-condition. Base: carousel.
 * Source: https://www.pfizerforall.com/ (.content-cards-carousel.block)
 * Generated: 2026-10-12
 *
 * Output: 2 columns, one row per slide.
 *   Cell 1: photo (desktop crop)
 *   Cell 2: h2 slide headline, h3 card heading, paragraph, CTA link
 *
 * Source structure (validated against source.html):
 *   .slides-container > div.carousel-slide                 (iterated; block-level div)
 *     .image-container > picture.desktop-image | picture.mobile-image
 *     .content-cards-carousel-content-headline-container h2
 *     .content-card .card-headline-container h3
 *     .content-card .card-body-container p
 *     .content-card .card-button-container a.button
 *   Carousel controls (.carousel-indicator-container, live region) are skipped.
 *
 * Only the desktop picture is kept: the block renders every picture in the media
 * cell and has no desktop/mobile switching, so a second picture would stack.
 *
 * Education template (https://www.pfizerforall.com/education/, classes include
 * `dynamic-article`): the slides are rendered client-side from an article index, so
 * the `articles` option config is emitted instead of slides:
 *   source | /education/article-index.json
 *   limit  | N        (source `top-N` class)
 *   paths  | <ul>     (only if the authored config has an `article-urls` / `paths` row)
 * The authored config is read from the page's same-origin .plain.html (as quiz-choice.js
 * does); the `article-config` row (showIndicationBadges) has no block equivalent.
 */
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

/** `articles` option config for a dynamic (index-driven) carousel. */
function parseArticles(element, document, params) {
  const cells = [['source', ARTICLE_INDEX]];

  const top = [...element.classList].map((c) => c.match(/^top-(\d+)$/)).find(Boolean);
  let limit = top ? top[1] : '';
  let paths = [];

  const plain = loadPlain(params);
  if (plain) {
    const blocks = [...plain.querySelectorAll('div.content-cards-carousel.dynamic-article')];
    const live = [...element.ownerDocument.querySelectorAll('.content-cards-carousel.block.dynamic-article')];
    const authored = blocks[Math.max(live.indexOf(element), 0)] || blocks[0];
    if (authored) {
      if (!limit) {
        const t = [...authored.classList].map((c) => c.match(/^top-(\d+)$/)).find(Boolean);
        if (t) limit = t[1];
      }
      [...authored.children].forEach((row) => {
        const [k, v] = [...row.children];
        if (!k || !v) return;
        const key = clean(k.textContent).toLowerCase();
        if (key === 'article-urls' || key === 'paths') {
          const items = [...v.querySelectorAll('li')].map((li) => clean(li.textContent));
          paths = items.length ? items : clean(v.textContent).split(/[\s,]+/).filter(Boolean);
        }
      });
    }
  }

  if (limit) cells.push(['limit', limit]);
  if (paths.length) {
    const ul = document.createElement('ul');
    paths.forEach((p) => {
      const li = document.createElement('li');
      li.textContent = p;
      ul.append(li);
    });
    cells.push(['paths', ul]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-condition', variants: ['articles'], cells });
  element.replaceWith(block);
}

export default function parse(element, { document, params }) {
  if (element.classList.contains('dynamic-article')) {
    parseArticles(element, document, params);
    return;
  }

  let slides = [...element.querySelectorAll(':scope > .slides-container > .carousel-slide')];
  if (!slides.length) slides = [...element.querySelectorAll('.carousel-slide')];

  const cells = [];
  slides.forEach((slide) => {
    // Media cell
    const imageContainer = slide.querySelector('.image-container, .visual-container') || slide;
    const picture = imageContainer.querySelector('picture.desktop-image')
      || imageContainer.querySelector('picture')
      || imageContainer.querySelector('img:not([src^="data:"])');

    // Content cell
    const contentCell = [];
    const headline = slide.querySelector('.content-cards-carousel-content-headline-container h1, .content-cards-carousel-content-headline-container h2')
      || slide.querySelector('.content-container h2');
    if (headline) contentCell.push(headline);

    const card = slide.querySelector('.content-card') || slide.querySelector('.carousel-content');
    if (card) {
      const cardHeading = card.querySelector('.card-headline-container h3, .card-headline-container h4')
        || card.querySelector('h3, h4');
      if (cardHeading) contentCell.push(cardHeading);
      const body = card.querySelector('.card-body-container');
      if (body) body.querySelectorAll('p').forEach((p) => contentCell.push(p));
      card.querySelectorAll('.card-button-container a[href], .button-container a[href]')
        .forEach((a) => {
          if (contentCell.some((el) => el.contains(a))) return;
          const p = document.createElement('p');
          p.append(a);
          contentCell.push(p);
        });
    }

    if (!picture && !contentCell.length) return;
    cells.push([picture || '', contentCell.length ? contentCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-condition', cells });
  element.replaceWith(block);
}
