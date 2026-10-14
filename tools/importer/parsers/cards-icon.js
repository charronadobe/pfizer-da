/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon. Base: cards.
 * Source: content-page template (/find-care/prepare-for-care icon-list two-column,
 *   /savings-support/self-pay icon-list)
 * Selector: #main > div.section.icon-list-container .icon-list.block
 * Generated: 2026-10-13
 *
 * Output (cards convention, blocks/cards-icon/cards-icon.js): one row per item,
 *   [icon image | h3, paragraph]
 *   Option `two-column` / `one-column` when the source block has that class
 *   (one-column: /find-care/cancer-screening/ icon-list.one-column.horizontal-icon)
 *
 * The section heading (.icon-list-content h2) sits INSIDE the block element, so it is
 * emitted as default content before the block.
 *
 * Source structure (validated against block-context/cards-icon/instance-1..2):
 *   .icon-list.block > .icon-list-inner
 *     .icon-list-content .icon-list-content-headline-container h2
 *     .icon-list-container > .icon-list-card                    (iterated; block-level div)
 *        .icon-list-card-icon span.icon.icon-{name} (sprite svg -> /assets/icons/{name}.svg)
 *        .icon-list-card-copy h3 > strong, p
 */
const ORIGIN = 'https://www.pfizerforall.com';
const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

function buildIcon(card, document) {
  const wrap = card.querySelector('.icon-list-card-icon');
  if (!wrap) return null;
  const img = wrap.querySelector('img');
  const raw = img ? img.getAttribute('src') || '' : '';
  const out = document.createElement('img');
  out.alt = '';
  if (raw && !raw.startsWith('data:')) {
    const abs = new URL(raw, ORIGIN).href;
    out.src = /\.svg$/.test(abs) ? `${abs}?format=svg` : abs;
    out.alt = img.getAttribute('alt') || '';
    return out;
  }
  const span = wrap.querySelector('span.icon');
  const name = span && [...span.classList].find((c) => c.startsWith('icon-'));
  if (!name) return null;
  // site icon loader strips an `asset-` prefix: icon-asset-pill-bottle -> pill-bottle.svg
  out.src = `${ORIGIN}/assets/icons/${name.replace(/^icon-/, '').replace(/^asset-/, '')}.svg?format=svg`;
  return out;
}

export default function parse(element, { document }) {
  const intro = [...element.querySelectorAll('.icon-list-content h2, .icon-list-content h3, .icon-list-content p')]
    .filter((el) => clean(el.textContent));

  let cards = [...element.querySelectorAll('.icon-list-container > .icon-list-card')];
  if (!cards.length) cards = [...element.querySelectorAll('.icon-list-card')];

  const cells = [];
  cards.forEach((card) => {
    const icon = buildIcon(card, document);
    const copy = card.querySelector('.icon-list-card-copy') || card;
    const text = [];
    const heading = copy.querySelector('h2, h3, h4');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(heading.textContent);
      text.push(h3);
    }
    copy.querySelectorAll('p').forEach((p) => {
      if (clean(p.textContent)) text.push(p);
    });
    if (!icon && !text.length) return;
    cells.push([icon || '', text.length ? text : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const variants = ['two-column', 'one-column'].filter((v) => element.classList.contains(v));
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', variants, cells });
  if (intro.length) element.before(...intro);
  element.replaceWith(block);
}
