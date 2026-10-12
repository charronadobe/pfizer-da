import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Columns (banner): contained, rounded banner with text + CTA in one cell
 * and a supporting image (e.g. device screenshot) in the other.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-banner-row');
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.classList.add('columns-banner-image');
        cell.querySelectorAll('picture > img').forEach((img) => {
          img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [
            { media: '(min-width: 900px)', width: '900' },
            { width: '600' },
          ]));
        });
      } else {
        cell.classList.add('columns-banner-content');
      }
    });
  });

  // flag off-site CTAs so they can carry an external-link affordance
  block.querySelectorAll('.columns-banner-content a[href]').forEach((link) => {
    try {
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) {
        link.classList.add('columns-banner-external');
        link.setAttribute('rel', 'noopener');
      }
    } catch {
      // ignore malformed URLs
    }
  });
}
