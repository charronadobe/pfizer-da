/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-article. Base: hero.
 * Source: https://www.pfizerforall.com/cancer
 * Selector: #main > div.section.featured-article-container .featured-article.block
 * Generated: 2026-10-13
 *
 * Output (blocks/hero-article/hero-article.js): 1 row, 1 cell:
 *   image, tags paragraph (comma-separated), h3, description paragraph,
 *   read-time paragraph, CTA link
 *
 * Source structure (validated against block-context/hero-article/instance-1.html):
 *   .featured-article.block .featured-article-content-section
 *     .content-section-image-container picture
 *        source[media="(min-width: 1024px)"] (desktop crop, jpg)  <- used
 *        img (mobile crop)                                         <- fallback
 *     .featured-article-content-wrapper
 *        .badge-container span.badge .badge__label        (tags)
 *        .featured-article-content-eyebrow-container p    (hidden by no-eyebrow; skipped)
 *        .featured-article-content-headline-container h3
 *        .featured-article-content-body-container p
 *        .featured-article-content-label-container p      (read time)
 *        p.button-container a.button
 */
const ORIGIN = 'https://www.pfizerforall.com';

function absUrl(src) {
  try { return new URL(src, ORIGIN).href; } catch (e) { return src; }
}

function desktopImage(picture, document) {
  if (!picture) return null;
  const img = picture.querySelector('img');
  const sources = [...picture.querySelectorAll('source')];
  const desktop = sources.find((s) => /min-width:\s*1024px/.test(s.getAttribute('media') || '')
    && !/webp/.test(s.getAttribute('type') || '') && !/format=webply/.test(s.getAttribute('srcset') || ''));
  let src = desktop ? (desktop.getAttribute('srcset') || '').trim().split(/\s+/)[0] : '';
  if (!src && img) src = img.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) return null;
  const out = document.createElement('img');
  out.src = absUrl(src);
  out.alt = (img && img.getAttribute('alt')) || '';
  return out;
}

const clean = (t) => t.replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const image = desktopImage(element.querySelector('.content-section-image-container picture') || element.querySelector('picture'), document);

  const heading = element.querySelector('.featured-article-content-headline-container h2, .featured-article-content-headline-container h3')
    || element.querySelector('h2, h3');
  const body = [...element.querySelectorAll('.featured-article-content-body-container p')];

  if (!heading && !body.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const content = [];
  if (image) content.push(image);

  const tags = [...element.querySelectorAll('.badge-container .badge')].map((b) => clean(b.textContent)).filter(Boolean);
  if (tags.length) {
    const p = document.createElement('p');
    p.textContent = tags.join(', ');
    content.push(p);
  }

  if (heading) content.push(heading);
  content.push(...body);
  element.querySelectorAll('.featured-article-content-label-container p').forEach((p) => {
    if (clean(p.textContent)) content.push(p);
  });
  element.querySelectorAll('.featured-article-content-wrapper .button-container a[href], .featured-article-content-wrapper a.button[href]')
    .forEach((a) => {
      if (content.some((el) => el.contains && el.contains(a))) return;
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    });

  const cells = [[content]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}
