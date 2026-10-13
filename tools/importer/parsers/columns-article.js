/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-article. Base: columns.
 * Source: https://www.pfizerforall.com/vaccines/
 * Selector: #main > div.section.image-1-5-container .image-1-5.block
 * Generated: 2026-10-13
 *
 * Output (blocks/columns-article/columns-article.js): 1 row, 2 cells:
 *   text: tags paragraph (comma-separated), h3, paragraph, italic read-time paragraph, CTA
 *   image: desktop picture
 *
 * The block's top heading (.image-top-heading h2 "Take a deeper look.") sits INSIDE the
 * block element, so it is emitted as default content before the block.
 *
 * Source structure (validated against block-context/columns-article/instance-1.html):
 *   .image-1-5.block
 *     .image-top-heading h2
 *     .image-1-5-card
 *       .image-container .desktop-image picture (source[media="(min-width: 600px)"] jpg 2000w)
 *                        .mobile-image picture (skipped)
 *       .content-container
 *          .badge-container span.badge .badge__label   (tags)
 *          .image-content-headline-container h3
 *          .image-content-body-container p
 *          .image-content-label-container p > em        (read time)
 *          .button-group a.button
 */
const ORIGIN = 'https://www.pfizerforall.com';

function absUrl(src) {
  try { return new URL(src, ORIGIN).href; } catch (e) { return src; }
}

function desktopImage(picture, document) {
  if (!picture) return null;
  const img = picture.querySelector('img');
  const source = [...picture.querySelectorAll('source')].find((s) => /min-width/.test(s.getAttribute('media') || '')
    && !/webp/.test(s.getAttribute('type') || '') && !/format=webply/.test(s.getAttribute('srcset') || ''));
  let src = source ? (source.getAttribute('srcset') || '').trim().split(/\s+/)[0] : '';
  if (!src && img) src = img.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) return null;
  const out = document.createElement('img');
  out.src = absUrl(src);
  out.alt = (img && img.getAttribute('alt')) || '';
  return out;
}

const clean = (t) => t.replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const intro = [...element.querySelectorAll('.image-top-heading h2, .image-top-heading h3, .image-top-heading p')];

  const picture = element.querySelector('.image-container .desktop-image picture')
    || element.querySelector('.image-container picture');
  const image = desktopImage(picture, document);

  const content = element.querySelector('.content-container') || element;
  const text = [];
  const tags = [...content.querySelectorAll('.badge-container .badge')].map((b) => clean(b.textContent)).filter(Boolean);
  if (tags.length) {
    const p = document.createElement('p');
    p.textContent = tags.join(', ');
    text.push(p);
  }
  const heading = content.querySelector('.image-content-headline-container h2, .image-content-headline-container h3, .image-content-headline-container h4');
  if (heading) text.push(heading);
  content.querySelectorAll('.image-content-body-container p').forEach((p) => text.push(p));
  content.querySelectorAll('.image-content-label-container p').forEach((p) => {
    const label = clean(p.textContent);
    if (!label) return;
    const out = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = label;
    out.append(em);
    text.push(out);
  });
  content.querySelectorAll('.button-group a[href], p.button-container a[href]').forEach((a) => {
    if (text.some((el) => el.contains(a))) return;
    const p = document.createElement('p');
    p.append(a);
    text.push(p);
  });

  if (!heading && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[text.length ? text : '', image || '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-article', cells });
  if (intro.length) element.before(...intro);
  element.replaceWith(block);
}
