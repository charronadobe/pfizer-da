import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Columns (intro): brand logo/image in one cell, heading + text in the other.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-intro-row');
    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      const hasText = [...cell.children]
        .some((el) => el.tagName !== 'PICTURE' && !el.querySelector('picture') && el.textContent.trim());
      if (picture && !hasText) {
        cell.classList.add('columns-intro-logo');
        const img = picture.querySelector('img');
        // vector logos are served as-is and tinted with the brand color via a CSS mask
        // (fill="currentColor" has no effect inside <img>); raster images get renditions
        if (img && /\.svg(\?|$)/i.test(img.src)) {
          cell.classList.add('columns-intro-logo-vector');
          cell.style.setProperty('--columns-intro-logo-src', `url("${img.src}")`);
        } else if (img) {
          picture.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]));
        }
      } else {
        cell.classList.add('columns-intro-content');
      }
    });
  });
}
