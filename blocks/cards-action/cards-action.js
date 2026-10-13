import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

function isIconCell(cell) {
  const hasMedia = cell.querySelector('picture, img, .icon');
  const text = cell.textContent.trim();
  return hasMedia && !text;
}

/**
 * Cards (action): each row is a tile with an icon, heading, text and a CTA.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = createTag('ul', { class: 'cards-action-list' });

  [...block.children].forEach((row) => {
    const li = createTag('li', { class: 'cards-action-card' });
    const cells = [...row.children];
    const iconCell = cells.find(isIconCell);
    const body = createTag('div', { class: 'cards-action-body' });

    if (iconCell) {
      iconCell.className = 'cards-action-icon';
      iconCell.querySelectorAll('picture > img').forEach((img) => {
        if (/\.svg(\?|$)/i.test(img.src)) return;
        img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '200' }]));
      });
      li.append(iconCell);
    }

    cells.filter((cell) => cell !== iconCell).forEach((cell) => body.append(...cell.childNodes));

    // keep the CTA anchored at the bottom of the tile
    const cta = [...body.querySelectorAll('a[href]')].pop();
    const ctaContainer = cta?.closest('.button-container') || cta?.parentElement;
    if (ctaContainer && ctaContainer !== body && ctaContainer === body.lastElementChild) {
      ctaContainer.classList.add('cards-action-cta');
      li.classList.add('cards-action-clickable');
      // source CTA is the small outlined pill
      if (cta.classList.contains('button')) cta.classList.add('secondary', 'button-sm');
    }

    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
