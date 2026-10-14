import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/** A paragraph made only of italic text (with optional line breaks / bold inside). */
function isItalic(p) {
  if (p.tagName !== 'P') return false;
  const em = [...p.querySelectorAll('em, i')].map((e) => e.textContent).join('');
  return em.trim() !== '' && em.replace(/\s+/g, '') === p.textContent.replace(/\s+/g, '');
}

/**
 * Quote (photo): full-bleed photo background with a testimonial quote, attribution and CTA.
 * Content: 1 row, 2 cells: image(s) | quote (heading or paragraph), italic attribution
 * paragraph(s) (name, role), CTA link. A second image in the image cell is used on mobile.
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const imageCell = cells.find((cell) => cell.querySelector('picture') && !cell.textContent.trim());
  const items = cells.filter((cell) => cell !== imageCell).flatMap((cell) => [...cell.children]);

  const media = createTag('div', { class: 'quote-photo-media' });
  const pictures = imageCell ? [...imageCell.querySelectorAll('picture')] : [];
  pictures.forEach((picture, idx) => {
    const img = picture.querySelector('img');
    if (!img) return;
    if (!img.hasAttribute('alt')) img.setAttribute('alt', '');
    // only same-origin images can go through the media bus; keep external ones as authored
    const sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
    const pic = sameOrigin
      ? createOptimizedPicture(img.src, img.alt, false, idx === 0
        ? [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]
        : [{ width: '750' }])
      : picture;
    if (pictures.length > 1) pic.classList.add(idx === 0 ? 'quote-photo-desktop' : 'quote-photo-mobile');
    media.append(pic);
  });

  const quoteEl = items.find((el) => /^H[1-6]$/.test(el.tagName))
    || items.find((el) => el.tagName === 'P' && !isItalic(el) && !el.querySelector('a') && el.textContent.trim());
  const attribution = items.filter((el) => el !== quoteEl && isItalic(el));
  const rest = items.filter((el) => el !== quoteEl && !attribution.includes(el));

  const figure = createTag('figure', { class: 'quote-photo-figure' });
  if (quoteEl) figure.append(createTag('blockquote', { class: 'quote-photo-quote' }, quoteEl));
  if (attribution.length) figure.append(createTag('figcaption', { class: 'quote-photo-attribution' }, attribution));

  const content = createTag('div', { class: 'quote-photo-content' }, [figure, ...rest]);
  block.replaceChildren(...(media.children.length ? [media] : []), content);
  if (!media.children.length) block.classList.add('quote-photo-no-image');
}
