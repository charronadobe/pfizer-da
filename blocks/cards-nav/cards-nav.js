import { createTag } from '../../scripts/shared.js';

/**
 * Cards (navigation): grid of fully clickable tiles, each a linked title + optional text.
 * Content: one row per tile, one cell: h3 containing a link (or a link paragraph) + paragraph.
 * A heading without a link takes the tile's first link. Option `blue`: solid blue title tiles.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = createTag('ul', { class: 'cards-nav-list' });

  [...block.children].forEach((row) => {
    const body = createTag('div', { class: 'cards-nav-body' });
    [...row.children].forEach((cell) => body.append(...cell.childNodes));
    const link = body.querySelector('a[href]');
    if (!link && !body.textContent.trim()) return;

    let title = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (link) {
      // links in their own paragraph get decorated as buttons: undo that inside a tile
      link.classList.remove('button', 'primary', 'secondary', 'button-sm');
      const holder = link.closest('p');
      holder?.classList.remove('button-container');
      if (title && !title.contains(link)) {
        if (holder && holder.textContent.trim() === link.textContent.trim()) holder.remove();
        link.textContent = title.textContent.trim();
        title.replaceChildren(link);
      } else if (!title) {
        title = holder || link;
      }
    }
    title?.classList.add('cards-nav-title');
    if (link) link.classList.add('cards-nav-link');

    const li = createTag('li', { class: link ? 'cards-nav-card cards-nav-clickable' : 'cards-nav-card' }, body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
