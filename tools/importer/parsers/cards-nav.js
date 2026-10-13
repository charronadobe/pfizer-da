/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-nav. Base: cards (1 column, "no images" convention).
 * Source: content-page template (/vaccines/ card-grid navigation,
 *   /find-care/biomarker-testing/ card-grid core-title-icon)
 * Selectors: #main > div.section.card-grid-container .card-grid.block.navigation
 *            #main > div.section.card-grid-container .card-grid.block.core-title-icon
 * Generated: 2026-10-13
 *
 * Output (blocks/cards-nav/cards-nav.js): one row per tile, one cell:
 *   h3 containing the tile link (+ optional description paragraph)
 *   Option `blue` for .core-title-icon (solid blue title tiles, no description)
 *
 * The section intro (.card-grid-content-container: eyebrow, h2, body) sits INSIDE the
 * block element, so it is emitted as default content before the block.
 *
 * Source structure (validated against block-context/cards-nav/instance-1..2):
 *   .card-grid.block > .card-grid-inner
 *     .card-grid-content-container (eyebrow p, h2, body p)
 *     .cards-grid-container > div.card                        (iterated; block-level div)
 *       navigation:   .card-headline-container h3, .card-body-container p,
 *                     p.button-container a (same href as a.card-link overlay)
 *       title-icon:   .card-title-icon p > a.button (+ chevron icon, skipped)
 */
const clean = (t) => t.replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const intro = [];
  const introRoot = element.querySelector('.card-grid-content-container');
  if (introRoot) {
    introRoot.querySelectorAll('.card-grid-content-eyebrow-container p, .card-grid-content-headline-container h2, .card-grid-content-headline-container h3, .card-grid-content-body-container p')
      .forEach((el) => intro.push(el));
  }

  let cards = [...element.querySelectorAll('.cards-grid-container > .card')];
  if (!cards.length) cards = [...element.querySelectorAll('.card')];

  const cells = [];
  cards.forEach((card) => {
    const headingEl = card.querySelector('.card-headline-container h2, .card-headline-container h3, .card-headline-container h4');
    const link = card.querySelector('.card-title-icon a[href], .button-container a[href]')
      || card.querySelector('a.card-link[href]')
      || card.querySelector('a[href]');
    const title = clean((headingEl || link || { textContent: '' }).textContent);
    if (!title && !link) return;

    const h3 = document.createElement('h3');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = title || clean(link.textContent);
      h3.append(a);
    } else {
      h3.textContent = title;
    }
    const cell = [h3];
    card.querySelectorAll('.card-body-container p').forEach((p) => {
      if (clean(p.textContent)) cell.push(p);
    });
    cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const variants = element.classList.contains('core-title-icon') ? ['blue'] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-nav', variants, cells });
  if (intro.length) element.before(...intro);
  element.replaceWith(block);
}
