/* eslint-disable */
/* global WebImporter */
/**
 * Parser for banner-cta. Base: banner.
 * Source: content-page template (/cancer banner, /vaccines/ banner-vaxassist)
 * Selectors: #main > div.section.banner-container .banner.block
 *            #main > div.section.banner-vaxassist-container .banner-vaxassist.block
 * Generated: 2026-10-13
 *
 * Output (blocks/banner-cta/banner-cta.js):
 *   Row 1 (1 cell): optional icon paragraph, h2, paragraph(s), CTA link (last link)
 *   Options: `gradient` (source class .gradient), `age-input` (source has .age-input-container)
 *   Row 2 (age-input only): field label | query parameter name
 *
 * Source structure (validated against block-context/banner-cta/instance-1..2):
 *   .banner.block                                   (/cancer)
 *     .icon-container span.icon.icon-{name}  (sprite svg -> /assets/icons/{name}.svg)
 *     .content-container h2 [p]
 *     p.button-container a.button
 *   .banner-vaxassist.gradient.block                (/vaccines/)
 *     .content-container h2 p
 *     .label-container p                    ("Get results in under 2 min.")
 *     .age-input-container label.input-label + input
 *     p.button-container.button-container-hidden a  (real destination, ?age= param)
 */
const ORIGIN = 'https://www.pfizerforall.com';

export default function parse(element, { document }) {
  const content = [];

  // Icon
  const span = element.querySelector('.icon-container span.icon');
  const iconName = span && [...span.classList].find((c) => c.startsWith('icon-'));
  const iconImg = element.querySelector('.icon-container img:not([src^="data:"])');
  if (iconImg || iconName) {
    const img = document.createElement('img');
    img.src = iconImg
      ? new URL(iconImg.getAttribute('src'), ORIGIN).href
      // site icon loader strips an `asset-` prefix: icon-asset-pill-bottle -> /assets/icons/pill-bottle.svg
      : `${ORIGIN}/assets/icons/${iconName.replace(/^icon-/, '').replace(/^asset-/, '')}.svg?format=svg`;
    img.alt = (iconImg && iconImg.getAttribute('alt')) || '';
    const p = document.createElement('p');
    p.append(img);
    content.push(p);
  }

  const heading = element.querySelector('.content-container h1, .content-container h2, .content-container h3')
    || element.querySelector('h2, h3');
  if (heading) content.push(heading);
  element.querySelectorAll('.content-container p, .label-container p').forEach((p) => {
    if (p.textContent.trim()) content.push(p);
  });

  const cta = element.querySelector('.button-container a[href]') || element.querySelector('a.button[href]');
  if (cta) {
    const p = document.createElement('p');
    p.append(cta);
    content.push(p);
  }

  if (!heading && !cta) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[content]];
  const variants = [];
  if (element.classList.contains('gradient')) variants.push('gradient');

  const ageInput = element.querySelector('.age-input-container');
  if (ageInput && cta) {
    variants.push('age-input');
    const labelEl = ageInput.querySelector('label');
    const label = labelEl ? labelEl.textContent.replace(/\s+/g, ' ').trim() : '';
    // query parameter = the empty-valued parameter on the CTA URL (e.g. ?age=), default "age"
    let param = 'age';
    try {
      const u = new URL(cta.getAttribute('href'), ORIGIN);
      const empty = [...u.searchParams.entries()].find(([, v]) => v === '');
      if (empty) [param] = empty;
    } catch (e) { /* keep default */ }
    cells.push([label, param]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'banner-cta', variants, cells });
  element.replaceWith(block);
}
