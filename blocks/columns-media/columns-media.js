import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * A paragraph whose entire content is a single <em> is treated as small print
 * (e.g. a disclaimer with an inline "See here" link, or a "Source: …" line).
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
 * A short paragraph directly above the heading (no links) is an eyebrow label.
 * @param {Element} p
 * @returns {boolean}
 */
function isEyebrow(p) {
  return p.tagName === 'P'
    && /^H[1-6]$/.test(p.nextElementSibling?.tagName || '')
    && !p.querySelector('a, picture')
    && !!p.textContent.trim();
}

/**
 * Same-origin images go through the AEM image pipeline; absolute third-party
 * URLs keep the authored <picture> untouched.
 * @param {HTMLImageElement} img
 * @returns {boolean}
 */
function isSameOrigin(img) {
  try {
    return new URL(img.getAttribute('src'), window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

/**
 * Wraps runs of two or more adjacent button paragraphs so they sit in one row.
 * @param {Element} cell
 */
function groupButtons(cell) {
  const runs = [];
  let run = [];
  [...cell.children].forEach((el) => {
    if (el.matches('p.button-container')) {
      run.push(el);
    } else {
      if (run.length > 1) runs.push(run);
      run = [];
    }
  });
  if (run.length > 1) runs.push(run);

  runs.forEach((buttons) => {
    const group = document.createElement('div');
    group.className = 'columns-media-buttons';
    buttons[0].before(group);
    group.append(...buttons);
  });
}

/**
 * Columns (media): a text cell and an image cell side by side.
 * Either cell order is supported — the authored order is kept on desktop.
 * Options: `full-bleed` (50/50 split, image runs to the page edge), `italic`
 * (small print stays italic).
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-media-row');
    const cells = [...row.children];
    cells.forEach((cell) => {
      const picture = cell.querySelector('picture');
      const hasText = !!cell.textContent.trim();
      if (picture && !hasText) {
        cell.classList.add('columns-media-image');
        const src = cell.querySelector('img')?.getAttribute('src') || '';
        if (/\.gif(\?|$)/i.test(src)) cell.classList.add('columns-media-image-natural');
        cell.querySelectorAll('picture > img').forEach((img) => {
          if (!isSameOrigin(img)) return;
          img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [
            { media: '(min-width: 900px)', width: '1200' },
            { width: '750' },
          ]));
        });
      } else if (!picture && !hasText) {
        // empty cell (e.g. missing image): keep it out of the layout
        cell.classList.add('columns-media-empty');
      } else {
        cell.classList.add('columns-media-content');
        cell.querySelectorAll(':scope > p').forEach((p) => {
          if (isSmallPrint(p)) p.classList.add('columns-media-small-print');
        });
        const first = cell.firstElementChild;
        if (first && isEyebrow(first)) first.classList.add('columns-media-eyebrow');
        groupButtons(cell);
      }
    });

    if (cells[0]?.classList.contains('columns-media-image')) {
      row.classList.add('columns-media-image-first');
    }
  });
}
