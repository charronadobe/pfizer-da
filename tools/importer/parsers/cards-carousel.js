/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-carousel. Base: cards.
 * Source: https://www.pfizerforall.com/cancer
 * Selector: #main > div.section.cards-carousel-container .cards-carousel.block:not(.dynamic-article)
 * Generated: 2026-10-13
 *
 * Output (cards convention, blocks/cards-carousel/cards-carousel.js): one row per card,
 *   [icon image | h3, paragraph, CTA link]
 *
 * The section intro (eyebrow, h2, body in .cards-carousel-content-section) sits
 * INSIDE the block element, so it is emitted as default content before the block.
 *
 * Source structure (validated against block-context/cards-carousel/instance-1.html):
 *   .cards-carousel.block > .cards-carousel-inner
 *     .cards-carousel-content-section (eyebrow p, h2, body p)
 *     ul.cards-list > li.card               (iterated; block-level li)
 *       .card-icon span.icon.icon-{name} > svg > use (sprite, no <img>)
 *       .card-content .card-headline-container h3 > strong
 *       .card-content .card-body-container p
 *       .card-content p.button-container > a.button
 *   .carousel-indicator-container (controls, skipped)
 * Sprite icons are replaced by the site's served file /assets/icons/{name}.svg
 * (query string appended so helix-importer does not rewrite it to :icon: notation).
 */
const ORIGIN = 'https://www.pfizerforall.com';

function absUrl(src) {
  try { return new URL(src, ORIGIN).href; } catch (e) { return src; }
}

function buildIcon(card, document) {
  const wrap = card.querySelector('.card-icon, .card-image');
  if (!wrap) return null;
  const img = wrap.querySelector('img');
  const raw = img ? img.getAttribute('src') || '' : '';
  if (raw && !raw.startsWith('data:')) {
    const out = document.createElement('img');
    out.src = absUrl(raw.endsWith('.svg') ? `${raw}?format=svg` : raw);
    out.alt = img.getAttribute('alt') || '';
    return out;
  }
  const span = wrap.querySelector('span.icon');
  const name = span && [...span.classList].find((c) => c.startsWith('icon-'));
  if (!name) return null;
  const out = document.createElement('img');
  out.src = `${ORIGIN}/assets/icons/${name.replace(/^icon-/, '')}.svg?format=svg`;
  out.alt = '';
  return out;
}

function unwrapStrong(heading) {
  heading.querySelectorAll('strong, b').forEach((s) => s.replaceWith(...s.childNodes));
  return heading;
}

export default function parse(element, { document }) {
  // Section intro inside the block element -> default content
  const intro = [];
  const introRoot = element.querySelector('.cards-carousel-content-section');
  if (introRoot) {
    introRoot.querySelectorAll('.cards-carousel-content-eyebrow-container p, .cards-carousel-content-headline-container h2, .cards-carousel-content-headline-container h3, .cards-carousel-content-body-container p')
      .forEach((el) => intro.push(el));
  }

  let cards = [...element.querySelectorAll('ul.cards-list > li.card')];
  if (!cards.length) cards = [...element.querySelectorAll('.card')].filter((c) => !c.closest('.cards-carousel-content-section'));

  const cells = [];
  cards.forEach((card) => {
    const icon = buildIcon(card, document);
    const content = card.querySelector('.card-content') || card;
    const text = [];
    const heading = content.querySelector('.card-headline-container h2, .card-headline-container h3, .card-headline-container h4')
      || content.querySelector('h2, h3, h4');
    if (heading) text.push(unwrapStrong(heading));
    content.querySelectorAll('.card-body-container p').forEach((p) => text.push(p));
    content.querySelectorAll('.button-container a[href]').forEach((a) => {
      const p = document.createElement('p');
      p.append(a);
      text.push(p);
    });
    if (!icon && !text.length) return;
    cells.push([icon || '', text.length ? text : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-carousel', cells });
  if (intro.length) element.before(...intro);
  element.replaceWith(block);
}
