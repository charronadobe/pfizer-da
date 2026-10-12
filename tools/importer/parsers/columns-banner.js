/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-banner. Base: columns.
 * Source: https://www.pfizerforall.com/ (.banner-1-2-wrapper)
 * Generated: 2026-10-12
 *
 * Output: 1 row x 2 columns.
 *   Cell 1: h2, paragraph(s), external CTA link
 *   Cell 2: phone image (desktop crop)
 *
 * Source structure (validated against source.html):
 *   .banner-1-2-wrapper > .banner-1-2.block
 *     .image-container.image-desktop picture | .image-container.image-mobile picture
 *     .content-wrapper
 *       .title-container h2
 *       .content-container p
 *       p.button-container > a.button[href^="https://healthanswers.pfizer.com"]
 * Only the desktop picture is kept (the block renders every picture in the cell).
 */
export default function parse(element, { document }) {
  const root = element.querySelector('.banner-1-2') || element;

  // Image cell
  const picture = root.querySelector('.image-container.image-desktop picture')
    || root.querySelector('.image-container picture')
    || root.querySelector('picture')
    || root.querySelector('img:not([src^="data:"])');

  // Text cell
  const content = root.querySelector('.content-wrapper') || root;
  const textCell = [];
  const heading = content.querySelector('.title-container h1, .title-container h2, .title-container h3')
    || content.querySelector('h2, h3');
  if (heading) textCell.push(heading);
  content.querySelectorAll('.content-container p').forEach((p) => {
    if (p.textContent.trim()) textCell.push(p);
  });
  content.querySelectorAll('.button-container a[href], a.button[href]')
    .forEach((a) => {
      if (textCell.some((el) => el.contains(a))) return;
      const p = document.createElement('p');
      p.append(a);
      textCell.push(p);
    });

  if (!picture && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell.length ? textCell : '', picture || '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-banner', cells });
  element.replaceWith(block);
}
