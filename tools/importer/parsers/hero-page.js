/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-page. Base: hero.
 * Source: content-page template (/cancer, /find-care/biomarker-testing/,
 *   /find-care/prepare-for-care, /find-care/talk-to-a-doctor,
 *   /savings-support/self-pay, /vaccines/)
 * Selector: #main > div.section.hero-container .hero.block
 * Generated: 2026-10-13
 *
 * Output follows the project block contract (blocks/hero-page/hero-page.js, which
 * accepts the image and text in one cell or in separate rows):
 *   Row 1 (1 cell): image, [announcement link paragraph], h1, body paragraph(s),
 *     optional disclaimer paragraph
 *   `announcement` option only when the source has .informational-banner a
 *     (savings-support/prescription-assistance); combined with `dropdown` if both.
 *   Row 2 (1 cell, `dropdown` option only): optional label paragraph +
 *     <ul> whose first (unlinked) item is the button text and each linked item
 *     is one option.
 *   The breadcrumb is NOT authored (the block builds it from the URL).
 *
 * Source structure (validated against block-context/hero-page/instance-1..6):
 *   .hero.block
 *     .hero-image-container picture.hero-image-responsive
 *        source[media="(min-width: 1024px) and (min-width: 600px)"] (desktop, png/jpg)
 *        img (mobile crop)
 *     .hero-inner-container
 *        nav.breadcrumb (skipped)
 *        .hero-headline-container h1
 *        .hero-body-container p
 *        .hero-label-container p > em   (self-pay disclaimer)
 *        .hero-dropdown-container .element-dropdown   (has-dropdown heroes)
 *           label.dropdown-label (optional), .dropdown-placeholder,
 *           ul.dropdown-menu > li.dropdown-option > a.dropdown-option-link
 */
const ORIGIN = 'https://www.pfizerforall.com';

function absUrl(src) {
  if (!src) return '';
  try { return new URL(src, ORIGIN).href; } catch (e) { return src; }
}

/** Desktop rendition of a responsive <picture> as a plain <img> with an absolute URL. */
function desktopImage(picture, document) {
  if (!picture) return null;
  const img = picture.querySelector('img');
  const sources = [...picture.querySelectorAll('source')];
  const desktop = sources.find((s) => /min-width:\s*1024px/.test(s.getAttribute('media') || '')
      && !/webp/.test(s.getAttribute('type') || ''));
  let src = desktop ? (desktop.getAttribute('srcset') || '').trim().split(/\s+/)[0] : '';
  if (!src && img) src = img.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) return null;
  const out = document.createElement('img');
  out.src = absUrl(src);
  out.alt = (img && img.getAttribute('alt')) || '';
  return out;
}

export default function parse(element, { document }) {
  const picture = element.querySelector('.hero-image-container picture')
    || element.querySelector('picture');
  const image = desktopImage(picture, document);

  const heading = element.querySelector('.hero-headline-container h1, .hero-headline-container h2')
    || element.querySelector('h1');

  const body = [...element.querySelectorAll('.hero-body-container p')];
  const label = [...element.querySelectorAll('.hero-label-container p')];

  if (!heading && !body.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Announcement strip (`announcement` option): .informational-banner a, shown between the
  // banner image and the text panel. Authored as a link-only paragraph after the image.
  const variants = [];
  const bannerLink = element.querySelector('.informational-banner a[href]');
  let announcement = null;
  if (bannerLink && bannerLink.textContent.trim()) {
    const link = document.createElement('a');
    link.href = bannerLink.getAttribute('href');
    const title = bannerLink.getAttribute('title');
    if (title) link.title = title;
    link.textContent = bannerLink.textContent.replace(/\s+/g, ' ').trim();
    announcement = document.createElement('p');
    announcement.append(link);
    variants.push('announcement');
  }

  const content = [];
  if (image) content.push(image);
  if (announcement) content.push(announcement);
  if (heading) content.push(heading);
  content.push(...body, ...label);

  const cells = [[content]];

  // Dropdown (care-type selector)
  const dropdown = element.querySelector('.hero-dropdown-container .element-dropdown')
    || element.querySelector('.element-dropdown');
  const options = dropdown ? [...dropdown.querySelectorAll('.dropdown-menu a[href]')] : [];
  if (options.length) {
    variants.push('dropdown');
    const selectorCell = [];
    const labelEl = dropdown.querySelector('.dropdown-label');
    if (labelEl && labelEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = labelEl.textContent.trim();
      selectorCell.push(p);
    }
    const ul = document.createElement('ul');
    const placeholder = dropdown.querySelector('.dropdown-placeholder');
    const prompt = placeholder ? placeholder.textContent.trim() : '';
    if (prompt) {
      const li = document.createElement('li');
      li.textContent = prompt;
      ul.append(li);
    }
    options.forEach((a) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.replace(/\s+/g, ' ').trim();
      li.append(link);
      ul.append(li);
    });
    selectorCell.push(ul);
    cells.push([selectorCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-page', variants, cells });
  element.replaceWith(block);
}
