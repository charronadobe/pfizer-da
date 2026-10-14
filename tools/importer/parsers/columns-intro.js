/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-intro. Base: columns.
 * Source: https://www.pfizerforall.com/ (.hero.has-carousel .hero-content)
 * Generated: 2026-10-12
 *
 * Output: 1 row x 2 columns.
 *   Cell 1: brand logo image
 *   Cell 2: heading + paragraph(s)
 *
 * Source structure (validated against source.html):
 *   .hero-rich-body-container
 *     .hero-content-picture-wrapper > span.icon.icon-pfizer-for-all-logo > img[src^="data:image/svg"]
 *     .hero-rich-content-wrapper > h2 + p
 * The logo is an inline SVG data URI rendered inside an EDS icon span. The parser
 * replaces it with the site's served file (/assets/icons/{name}.svg?format=svg) so
 * the document gets a real image (see comment in the image-cell branch).
 */
export default function parse(element, { document }) {
  const pictureWrap = element.querySelector('.hero-content-picture-wrapper');
  const contentWrap = element.querySelector('.hero-rich-content-wrapper')
    || element.querySelector('.hero-content-container');

  // Logo / image cell
  const imageCell = [];
  if (pictureWrap) {
    const picture = pictureWrap.querySelector('picture');
    const img = pictureWrap.querySelector('img');
    if (picture) {
      imageCell.push(picture);
    } else if (img || pictureWrap.querySelector('span.icon')) {
      // Inline data-URI images are dropped by html2md, and any src ending in
      // ".svg" is rewritten to :icon: notation by helix-importer convertIcons
      // (unresolvable here: the project has no /icons folder). Point at the
      // site's served SVG with a query string so it imports as a real image.
      const iconSpan = pictureWrap.querySelector('span.icon');
      const iconClass = iconSpan && [...iconSpan.classList].find((c) => c.startsWith('icon-') && c !== 'icon');
      // site icon loader strips an `asset-` prefix: icon-asset-pill-bottle -> pill-bottle.svg
      const iconName = iconClass ? iconClass.replace(/^icon-/, '').replace(/^asset-/, '') : null;
      const rawSrc = img ? img.getAttribute('src') : '';
      let src = null;
      if (iconName) src = `https://www.pfizerforall.com/assets/icons/${iconName}.svg?format=svg`;
      else if (rawSrc && !rawSrc.startsWith('data:')) src = rawSrc.endsWith('.svg') ? `${rawSrc}?format=svg` : rawSrc;
      if (src) {
        const logo = document.createElement('img');
        logo.src = src;
        logo.alt = (img && img.getAttribute('alt')) || 'PfizerForAll';
        imageCell.push(logo);
      }
    }
  }

  // Text cell
  const textCell = [];
  if (contentWrap) {
    const heading = contentWrap.querySelector('h1, h2, h3, h4');
    if (heading) textCell.push(heading);
    contentWrap.querySelectorAll('p').forEach((p) => {
      if (p.textContent.trim() || p.querySelector('a, img')) textCell.push(p);
    });
    contentWrap.querySelectorAll('a.button').forEach((a) => {
      if (!textCell.some((el) => el.contains(a))) textCell.push(a);
    });
  }

  if (!imageCell.length && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[imageCell.length ? imageCell : '', textCell.length ? textCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-intro', cells });
  element.replaceWith(block);
}
