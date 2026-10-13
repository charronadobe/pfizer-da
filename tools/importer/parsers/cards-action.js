/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-action. Base: cards.
 * Sources:
 *   home template:         https://www.pfizerforall.com/ (.card-grid .cards-grid-container)
 *   content-page template: #main > div.section.card-grid-container
 *                          .card-grid.block:not(.navigation):not(.core-title-icon)
 *                          (/find-care/talk-to-a-doctor: 2 tiles, sprite icons, no CTA)
 * Generated: 2026-10-12, extended for content-page 2026-10-13
 *
 * Output: 2 columns, one row per tile.
 *   Cell 1: icon image
 *   Cell 2: h3, paragraph, CTA link
 *
 * Source structure (validated against source.html):
 *   .cards-grid-container > div.card.card-clickable          (iterated; block-level div)
 *     .card-icon > span.icon.icon-{name} > img[src^="data:image/svg"]
 *     .card-content .card-headline-container h3
 *     .card-content .card-body-container p
 *     .card-content p.button-container > a.button
 *     a.card-link (empty overlay link, same href as CTA - skipped)
 *
 * Icons are inline data-URI SVGs (dropped by html2md), so they are replaced with
 * the site's served file /assets/icons/{name}.svg. A query string is appended
 * because helix-importer convertIcons rewrites any src ending in ".svg" to
 * :icon: notation, which this project cannot resolve (no /icons folder).
 */
export default function parse(element, { document }) {
  // content-page instance (#main .card-grid.block, /find-care/talk-to-a-doctor): the
  // element is the whole block, so the section intro (.card-grid-content-container:
  // eyebrow, h2, body) sits inside it and is emitted as default content before the
  // block. The homepage element (.cards-grid-container) never contains it.
  const intro = [];
  const introRoot = element.querySelector('.card-grid-content-container');
  if (introRoot) {
    introRoot.querySelectorAll('.card-grid-content-eyebrow-container p, .card-grid-content-headline-container h2, .card-grid-content-headline-container h3, .card-grid-content-body-container p')
      .forEach((el) => intro.push(el));
  }

  let cards = [...element.querySelectorAll(':scope > .card')];
  if (!cards.length) cards = [...element.querySelectorAll('.cards-grid-container > .card')];
  if (!cards.length) cards = [...element.querySelectorAll('.card')];

  const buildIcon = (card) => {
    const iconWrap = card.querySelector('.card-icon');
    if (!iconWrap) return null;
    const picture = iconWrap.querySelector('picture');
    if (picture) return picture;
    const img = iconWrap.querySelector('img');
    const span = iconWrap.querySelector('span.icon');
    const iconClass = span && [...span.classList].find((c) => c.startsWith('icon-'));
    // site icon loader strips an `asset-` prefix: icon-asset-pill-bottle -> pill-bottle.svg
    const name = iconClass ? iconClass.replace(/^icon-/, '').replace(/^asset-/, '') : null;
    const raw = img ? img.getAttribute('src') : '';
    let src = null;
    if (name) src = `https://www.pfizerforall.com/assets/icons/${name}.svg?format=svg`;
    else if (raw && !raw.startsWith('data:')) src = raw.endsWith('.svg') ? `${raw}?format=svg` : raw;
    if (!src) return null;
    const icon = document.createElement('img');
    icon.src = src;
    icon.alt = (img && img.getAttribute('alt')) || '';
    return icon;
  };

  const cells = [];
  cards.forEach((card) => {
    const icon = buildIcon(card);

    const content = card.querySelector('.card-content') || card;
    const textCell = [];
    const heading = content.querySelector('.card-headline-container h1, .card-headline-container h2, .card-headline-container h3, .card-headline-container h4')
      || content.querySelector('h2, h3, h4');
    if (heading) textCell.push(heading);
    const body = content.querySelector('.card-body-container');
    if (body) body.querySelectorAll('p').forEach((p) => textCell.push(p));

    let ctas = [...content.querySelectorAll('.button-container a[href], a.button[href]')]
      .filter((a, i, arr) => arr.indexOf(a) === i);
    // Fallback: use the overlay card link when no visible CTA exists
    if (!ctas.length) {
      const overlay = card.querySelector('a.card-link[href]');
      if (overlay && heading) {
        const a = document.createElement('a');
        a.href = overlay.getAttribute('href');
        a.textContent = heading.textContent.trim();
        ctas = [a];
      }
    }
    ctas.forEach((a) => {
      const p = document.createElement('p');
      p.append(a);
      textCell.push(p);
    });

    if (!icon && !textCell.length) return;
    cells.push([icon || '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-action', cells });
  if (intro.length) element.before(...intro);
  element.replaceWith(block);
}
