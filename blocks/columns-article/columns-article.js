import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * A paragraph whose entire content is a single <em> is a small label (e.g. "5 min read").
 * @param {Element} p
 * @returns {boolean}
 */
function isLabel(p) {
  const em = p.firstElementChild;
  return p.children.length === 1
    && em.tagName === 'EM'
    && p.textContent.trim() === em.textContent.trim();
}

/**
 * @param {string} src
 * @returns {boolean}
 */
function isSameOrigin(src) {
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Content before the heading is the tag list: a bulleted list, or a paragraph of
 * comma-separated tags.
 * @param {Element} cell
 */
function decorateTags(cell) {
  const heading = cell.querySelector(':scope > :is(h1, h2, h3, h4, h5, h6)');
  if (!heading) return;
  const before = [];
  let el = heading.previousElementSibling;
  while (el) {
    before.unshift(el);
    el = el.previousElementSibling;
  }
  const tags = before.flatMap((node) => {
    if (node.matches('ul, ol')) return [...node.children].map((li) => li.textContent.trim());
    if (node.tagName === 'P' && !node.querySelector('picture, a')) {
      return node.textContent.split(',').map((t) => t.trim());
    }
    return [];
  }).filter(Boolean);
  if (!tags.length) return;
  before.forEach((node) => node.remove());
  heading.before(createTag('ul', { class: 'columns-article-tags' }, tags.map((t) => createTag('li', {}, t))));
}

/**
 * Columns (article): featured-article split card - text panel | flush image.
 * Content: 1 row, 2 cells: tags, h3, paragraph, italic read-time label, CTA | image.
 * Either cell order is supported.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-article-row');
    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && !cell.textContent.trim()) {
        cell.classList.add('columns-article-image');
        cell.querySelectorAll('picture > img').forEach((img) => {
          img.alt = img.alt || '';
          // only same-origin images can go through the media optimizer; render others as-is
          if (!isSameOrigin(img.src)) {
            img.loading = 'lazy';
            return;
          }
          img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [
            { media: '(min-width: 900px)', width: '1200' },
            { width: '750' },
          ]));
        });
      } else {
        cell.classList.add('columns-article-content');
        decorateTags(cell);
        cell.querySelectorAll(':scope > p').forEach((p) => {
          if (isLabel(p)) p.classList.add('columns-article-label');
        });
      }
    });
  });
}
