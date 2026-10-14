/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-callout. Base: columns.
 * Source: https://www.pfizerforall.com/find-care/cancer-screening/
 * Selector: #main > div.section.content-card-container .content-card.block
 * Generated: 2026-10-13
 *
 * Output (blocks/columns-callout/columns-callout.js): 1 row x 2 columns
 *   Cell 1: logo image
 *   Cell 2: h2 + paragraph(s) (links preserved)
 *
 * Source structure (validated against block-context/columns-callout/cancer-screening-instance.html):
 *   .content-card.block > .content-card-container
 *     .content-card-title h2
 *     .content-card-logo
 *       span.icon.icon-acs-logo.normal-theme        (sprite svg; used)
 *       span.icon.icon-acs-logo-relief.relief-theme (alternate-theme duplicate; skipped)
 *     .content-card-body p (with link)
 * The sprite icon is replaced by the site's served file /assets/icons/{name}.svg
 * (verified 200); the query string keeps helix-importer from rewriting it to :icon:
 * notation (no /icons folder). The sprite carries no usable alt (aria-label is
 * "Icon - acs-logo"), so known logos get their organisation name as alt text.
 */
const ORIGIN = 'https://www.pfizerforall.com';
const LOGO_ALT = { 'acs-logo': 'American Cancer Society' };
const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

function buildLogo(wrap, document) {
  if (!wrap) return null;
  const picture = wrap.querySelector('picture');
  if (picture) return picture;
  const img = wrap.querySelector('img');
  const rawSrc = img ? img.getAttribute('src') || '' : '';
  if (rawSrc && !rawSrc.startsWith('data:')) {
    const out = document.createElement('img');
    const abs = new URL(rawSrc, ORIGIN).href;
    out.src = /\.svg$/.test(abs) ? `${abs}?format=svg` : abs;
    out.alt = img.getAttribute('alt') || '';
    return out;
  }
  // first icon that is not the alternate (relief) theme duplicate
  const spans = [...wrap.querySelectorAll('span.icon')];
  const span = spans.find((s) => !s.classList.contains('relief-theme')
    && ![...s.classList].some((c) => /^icon-.*-relief$/.test(c))) || spans[0];
  const cls = span && [...span.classList].find((c) => c.startsWith('icon-'));
  if (!cls) return null;
  // site icon loader strips an `asset-` prefix: icon-asset-pill-bottle -> pill-bottle.svg
  const name = cls.replace(/^icon-/, '').replace(/^asset-/, '');
  const out = document.createElement('img');
  out.src = `${ORIGIN}/assets/icons/${name}.svg?format=svg`;
  out.alt = LOGO_ALT[name] || '';
  return out;
}

export default function parse(element, { document }) {
  const logo = buildLogo(element.querySelector('.content-card-logo'), document);

  const text = [];
  const heading = element.querySelector('.content-card-title h2, .content-card-title h3')
    || element.querySelector('h2, h3');
  if (heading) text.push(heading);
  const body = element.querySelector('.content-card-body');
  (body ? [...body.querySelectorAll('p')] : [...element.querySelectorAll('p')])
    .filter((p) => clean(p.textContent))
    .forEach((p) => text.push(p));

  if (!logo && !text.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[logo || '', text.length ? text : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-callout', cells });
  element.replaceWith(block);
}
