import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

function isIconCell(cell) {
  return cell.querySelector('picture, img, .icon') && !cell.textContent.trim();
}

/**
 * Cards (icon): a plain (untiled) list of items - line icon, heading, text.
 * Content: one row per item, 2 cells: icon | h3, paragraph (an icon paragraph at the top of
 * a single cell also works). Mobile/tablet: one stack, icon left of the copy, dividers between
 * items. Desktop: 3 per row, icon above the copy; option `two-column`: 2 per row; option
 * `one-column`: stays a single stack with the icon on the left, and the section heading (default
 * content before the block) sits on the left. Options are CSS-only, so decorate() does not branch
 * on them. SVG line icons are tinted with the brand color in CSS.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = createTag('ul', { class: 'cards-icon-list' });

  [...block.children].forEach((row) => {
    const li = createTag('li', { class: 'cards-icon-item' });
    const cells = [...row.children];
    let iconCell = cells.find(isIconCell);
    const body = createTag('div', { class: 'cards-icon-body' });
    cells.filter((cell) => cell !== iconCell).forEach((cell) => body.append(...cell.childNodes));

    // single-cell authoring: a leading icon-only paragraph is the icon
    const first = body.firstElementChild;
    if (!iconCell && first?.tagName === 'P' && isIconCell(first)) {
      iconCell = createTag('div', {}, first);
    }

    if (iconCell) {
      iconCell.className = 'cards-icon-icon';
      iconCell.querySelectorAll('picture > img').forEach((img) => {
        if (/\.svg(\?|$)/i.test(img.src)) {
          // monochrome line icon: CSS tints it with the brand color
          iconCell.classList.add('cards-icon-icon-svg');
          return;
        }
        img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '200' }]));
      });
      li.append(iconCell);
    }
    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
