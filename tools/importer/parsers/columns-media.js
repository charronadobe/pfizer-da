/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Source: https://www.pfizerforall.com/ (.image-1-2-wrapper) - 2 instances
 * Generated: 2026-10-12
 *
 * Output: 1 row x 2 columns, in the source's visual order.
 *   .image-1-2.desktop-right  -> [text | image]   (section 4)
 *   .image-1-2 (default)      -> [image | text]   (section 5)
 *   Text cell: h2, body paragraph(s), small-print label paragraph (with link), CTA
 *   Image cell: desktop picture
 *
 * Source structure (validated against source.html and instances/01.html):
 *   .image-1-2-wrapper > .image-1-2.block
 *     .image-container > .image-1-2-desktop-image picture | .image-1-2-mobile-image picture
 *     .content-container
 *       .image-content-headline-container h2
 *       .image-content-body-container p
 *       .image-content-label-container p   (optional, section 4 only)
 *       .button-group a.button
 * Only the desktop picture is kept (the block renders every picture in the cell).
 * All lookups are scoped to this element's own .image-1-2 so a neighbouring
 * instance can never be picked up.
 */
export default function parse(element, { document }) {
  const root = element.querySelector(':scope > .image-1-2')
    || (element.classList.contains('image-1-2') ? element : element.querySelector('.image-1-2'))
    || element;

  const own = (sel) => [...root.querySelectorAll(sel)]
    .filter((el) => el.closest('.image-1-2') === root || root === element);

  // Image cell
  const imageContainer = own('.image-container')[0];
  let picture = null;
  if (imageContainer) {
    picture = imageContainer.querySelector('.image-1-2-desktop-image picture, .desktop-image picture')
      || imageContainer.querySelector('picture')
      || imageContainer.querySelector('img');
  }

  // Text cell
  const content = own('.content-container')[0];
  const textCell = [];
  if (content) {
    const heading = content.querySelector('.image-content-headline-container h1, .image-content-headline-container h2, .image-content-headline-container h3')
      || content.querySelector('h2, h3');
    if (heading) textCell.push(heading);
    content.querySelectorAll('.image-content-body-container p, .image-content-label-container p')
      .forEach((p) => textCell.push(p));
    content.querySelectorAll('.button-group a[href], p.button-container a[href]')
      .forEach((a) => {
        if (textCell.some((el) => el.contains(a))) return;
        const p = document.createElement('p');
        p.append(a);
        textCell.push(p);
      });
  }

  if (!picture && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const imageCell = picture || '';
  const text = textCell.length ? textCell : '';
  const textFirst = root.classList.contains('desktop-right');
  const cells = [textFirst ? [text, imageCell] : [imageCell, text]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
