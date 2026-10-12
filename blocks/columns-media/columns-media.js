import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * A paragraph whose entire content is a single <em> is treated as small print
 * (e.g. a disclaimer with an inline "See here" link).
 * @param {Element} p
 * @returns {boolean}
 */
function isSmallPrint(p) {
  const em = p.firstElementChild;
  return p.children.length === 1
    && em.tagName === 'EM'
    && p.textContent.trim() === em.textContent.trim();
}

/**
 * Columns (media): a text cell and an image cell side by side.
 * Either cell order is supported — the authored order is kept on desktop.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-media-row');
    const cells = [...row.children];
    cells.forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && !cell.textContent.trim()) {
        cell.classList.add('columns-media-image');
        cell.querySelectorAll('picture > img').forEach((img) => {
          img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [
            { media: '(min-width: 900px)', width: '1200' },
            { width: '750' },
          ]));
        });
      } else {
        cell.classList.add('columns-media-content');
        cell.querySelectorAll(':scope > p').forEach((p) => {
          if (isSmallPrint(p)) p.classList.add('columns-media-small-print');
        });
      }
    });

    if (cells[0]?.classList.contains('columns-media-image')) {
      row.classList.add('columns-media-image-first');
    }
  });
}
