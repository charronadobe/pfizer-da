import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * @param {Element} el
 * @returns {boolean} true when the element holds only an image / icon (no text)
 */
function isMediaOnly(el) {
  return !!el.querySelector('picture, img, .icon') && !el.textContent.trim();
}

/**
 * Columns (callout): rounded panel with a logo beside a heading + text.
 * Content: 1 row, 2 cells: logo image | heading, paragraph(s). A logo paragraph at the top of a
 * single cell also works; a panel without a logo or heading renders the remaining parts alone.
 * Decorated as title / media / body so the layout can stack (mobile) or sit in a grid (desktop).
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  let mediaCell = cells.find(isMediaOnly);
  const body = createTag('div', { class: 'columns-callout-body' });
  cells.filter((cell) => cell !== mediaCell).forEach((cell) => body.append(...cell.childNodes));

  // single-cell authoring: a leading image-only paragraph is the logo
  const first = body.firstElementChild;
  if (!mediaCell && first && isMediaOnly(first)) mediaCell = createTag('div', {}, first);

  const children = [];

  // a leading heading becomes the panel title
  const heading = body.firstElementChild;
  if (heading && /^H[1-6]$/.test(heading.tagName)) {
    children.push(createTag('div', { class: 'columns-callout-title' }, heading));
  }

  if (mediaCell) {
    mediaCell.className = 'columns-callout-media';
    mediaCell.querySelectorAll('picture > img').forEach((img) => {
      if (/\.svg(\?|$)/i.test(img.src)) return;
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '400' }]));
    });
    children.push(mediaCell);
  }

  if (body.children.length || body.textContent.trim()) children.push(body);
  block.replaceChildren(...children);
}
