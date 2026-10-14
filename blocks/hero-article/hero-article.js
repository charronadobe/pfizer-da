import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
const isButton = (el) => el.classList.contains('button-container');

/**
 * Tags are authored above the heading, either as a list or as a paragraph of
 * comma-separated topics (e.g. "Vaccines, Considerations").
 * @param {Element[]} nodes
 * @returns {Element|null}
 */
function buildTags(nodes) {
  const labels = nodes.flatMap((el) => {
    if (el.tagName === 'UL' || el.tagName === 'OL') {
      return [...el.children].map((li) => li.textContent.trim());
    }
    return el.textContent.split(',').map((t) => t.trim());
  }).filter(Boolean);
  if (!labels.length) return null;
  return createTag('ul', { class: 'hero-article-tags' }, labels.map((label) => createTag('li', {}, label)));
}

/**
 * Hero (article): featured-article promo on a full-bleed photo with a scrim.
 * Content: one row; image, tags, heading, description, meta label (e.g. read time), CTA.
 * @param {Element} block
 */
export default function decorate(block) {
  const media = createTag('div', { class: 'hero-article-media' });
  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const holder = picture.parentElement;
    const url = new URL(img.getAttribute('src'), window.location.href);
    if (url.origin === window.location.origin) {
      // same-origin media: let the media bus serve responsive renditions
      media.append(createOptimizedPicture(url.pathname, img.alt || '', false, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]));
      picture.remove();
    } else {
      // external image: keep the authored picture as-is (below the fold, so lazy-load)
      if (!img.hasAttribute('loading')) img.loading = 'lazy';
      img.alt = img.alt || '';
      media.append(picture);
    }
    if (holder?.tagName === 'P' && !holder.textContent.trim() && !holder.children.length) holder.remove();
  }

  const nodes = [...block.querySelectorAll(':scope > div > div > *')];
  const headingIdx = nodes.findIndex(isHeading);
  const content = createTag('div', { class: 'hero-article-content' });

  if (headingIdx > 0) {
    const tags = buildTags(nodes.slice(0, headingIdx));
    if (tags) content.append(tags);
  }

  const rest = headingIdx === -1 ? nodes : nodes.slice(headingIdx);
  let seenText = false;
  rest.forEach((el) => {
    if (el.tagName === 'P' && !isButton(el)) {
      // first paragraph is the description; any following ones are meta (e.g. "5 min read")
      if (seenText) el.classList.add('hero-article-meta');
      seenText = true;
    }
    if (isButton(el)) el.querySelectorAll('a.button').forEach((a) => a.classList.add('button-sm'));
    content.append(el);
  });

  block.replaceChildren(...(media.children.length ? [media] : []), content);
  if (!media.children.length) block.classList.add('hero-article-no-image');
}
