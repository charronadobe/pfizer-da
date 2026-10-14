/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote-photo. Base: quote.
 * Source: https://www.pfizerforall.com/find-care/biomarker-testing/ (section-level capture
 *   block-context/quote-photo/source.html; the quote section is served as a page variation)
 * Selector: #main > div.section.quote-container .quote.block
 * Generated: 2026-10-13
 *
 * Output (blocks/quote-photo/quote-photo.js): 1 row, 2 cells:
 *   images: desktop photo (+ mobile photo when it differs)
 *   quote:  h2 quote, italic attribution paragraph(s), CTA link
 *
 * Source structure (validated against block-context/quote-photo/source.html):
 *   .quote.block
 *     .quote-image-background .quote-desktop-image picture | .quote-mobile-image picture
 *     .quote-content-container
 *        .quote-icon-container span.icon (decorative quote mark, skipped)
 *        .quote-text-container h2
 *        .quote-label-container p (<em><strong>Name</strong></em><br><em>Role</em>)
 *        .quote-button-container a.button
 * Relative image paths ("./media_...") are resolved against the page URL.
 */
function pageUrl(params) {
  if (params && params.originalURL) return params.originalURL;
  try { if (/^https?:/.test(window.location.href)) return window.location.href; } catch (e) { /* no window */ }
  return '';
}

function toImage(picture, document, base) {
  const img = picture && picture.querySelector('img');
  if (!img) return null;
  let src = img.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) return null;
  if (base && !/^https?:/.test(src)) {
    try { src = new URL(src, base).href; } catch (e) { /* keep relative */ }
  }
  const out = document.createElement('img');
  out.src = src;
  out.alt = img.getAttribute('alt') || '';
  return out;
}

const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document, params }) {
  const base = pageUrl(params);
  const desktop = toImage(element.querySelector('.quote-desktop-image picture'), document, base)
    || toImage(element.querySelector('.quote-image-background picture'), document, base);
  const mobile = toImage(element.querySelector('.quote-mobile-image picture'), document, base);
  const images = [];
  if (desktop) images.push(desktop);
  if (mobile && (!desktop || mobile.src !== desktop.src)) images.push(mobile);

  const content = element.querySelector('.quote-content-container') || element;
  const text = [];
  const quote = content.querySelector('.quote-text-container h1, .quote-text-container h2, .quote-text-container h3, .quote-text-container p');
  if (quote) text.push(quote);
  content.querySelectorAll('.quote-label-container p').forEach((p) => {
    if (clean(p.textContent)) text.push(p);
  });
  content.querySelectorAll('.quote-button-container a[href]').forEach((a) => {
    const p = document.createElement('p');
    p.append(a);
    text.push(p);
  });

  if (!quote && !images.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[images.length ? images : '', text.length ? text : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-photo', cells });
  element.replaceWith(block);
}
