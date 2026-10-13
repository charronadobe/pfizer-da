/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Sources:
 *   home template:         https://www.pfizerforall.com/ (.image-1-2-wrapper) - 2 instances
 *   content-page template: #main > div.section.image-1-1-container .image-1-1.block
 *                          #main > div.section.image-1-2-container .image-1-2.block
 *                          (/cancer, /find-care/*, /vaccines/)
 * Generated: 2026-10-12, extended for content-page 2026-10-13
 *
 * Output: 1 row x 2 columns, in the source's visual (desktop) order.
 *   .desktop-right (image on the right) -> [text | image]
 *   default                             -> [image | text]
 *   Text cell: optional eyebrow paragraph, h2, body paragraph(s),
 *              small-print / italic source paragraph(s) (.image-content-label-container),
 *              CTA link(s) (each in its own paragraph; optional)
 *   Image cell: desktop picture of the default (light) image set
 *
 * Source structure (validated against block-context/columns-media/source.html,
 * instances/01.html (home) and instance-1..12.html (content pages)):
 *   [.image-1-2-wrapper >] .image-1-1|.image-1-2 .block.base-image-block
 *     .image-container
 *        [.image-default >] .desktop-image picture | .mobile-image picture
 *        [.image-relief > ...]   dark-mode duplicates (skipped)
 *     .content-container
 *       .image-content-eyebrow-container p     (content pages)
 *       .image-content-headline-container h2
 *       .image-content-body-container p
 *       .image-content-label-container p       (home small print; vaccines italic "Source: CDC")
 *       .button-group a.button                 (optional; may hold several links)
 *
 * Block options: image-1-1 -> `full-bleed`, class italic-text -> `italic`
 *   (e.g. "Columns Media (full-bleed, italic)"); image-1-2 -> no option.
 *
 * Lazy images (.lazy-in-view, /vaccines/): until scrolled into view the <img> holds a
 * data: placeholder and no <source> has a srcset; helix-importer's preProcess then drops
 * that <img> entirely before transform. The real URL is read from the page's EDS
 * .plain.html (same origin): by alt text if the <img> survived, else the `image` row of
 * the same-type plain block whose text contains this instance's heading. GIFs use the
 * original media URL (no optimization query).
 * Relative src values ("./media_...") are resolved against the page URL.
 * All lookups are scoped to this element's own block root so a neighbouring
 * instance can never be picked up.
 */
const ROOT_SEL = '.image-1-2, .image-1-1, .base-image-block';

function pageUrl(params) {
  if (params && params.originalURL) return params.originalURL;
  try { return window.location.href; } catch (e) { return ''; }
}

let plainDoc;
/** Synchronously load the page's EDS .plain.html (same origin) once to resolve lazy images. */
function loadPlain(params) {
  if (plainDoc !== undefined) return plainDoc;
  plainDoc = null;
  const bases = [];
  try { if (/^https?:/.test(window.location.href)) bases.push(window.location.href); } catch (e) { /* no window */ }
  if (params && params.originalURL) bases.push(params.originalURL);
  const tried = new Set();
  for (const base of bases) {
    let u;
    try { u = new URL(base); } catch (e) { continue; }
    const p = u.pathname.replace(/\.html?$/, '');
    const candidates = p.endsWith('/') ? [`${p}index.plain.html`] : [`${p}.plain.html`, `${p}/index.plain.html`];
    for (const c of candidates) {
      const href = `${u.origin}${c}`;
      if (tried.has(href)) continue;
      tried.add(href);
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', href, false);
        xhr.send();
        if (xhr.status === 200 && /<div/.test(xhr.responseText)) {
          plainDoc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
          return plainDoc;
        }
      } catch (e) { /* try next */ }
    }
  }
  return plainDoc;
}

const norm = (t) => (t || '').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Authored <img> of this block in the page's .plain.html: the plain block of the same type
 * (image-1-1 / image-1-2) whose text contains this instance's heading, `image` row.
 */
function plainImage(root, alt, params) {
  const plain = loadPlain(params);
  if (!plain) return null;
  if (alt) {
    const byAlt = [...plain.querySelectorAll('img')].find((i) => (i.getAttribute('alt') || '') === alt);
    if (byAlt) return byAlt;
  }
  const type = ['image-1-1', 'image-1-2'].find((c) => root.classList.contains(c));
  const heading = root.querySelector('h1, h2, h3');
  if (!type || !heading) return null;
  const h = norm(heading.textContent);
  const block = [...plain.querySelectorAll(`div.${type}`)].find((b) => h && norm(b.textContent).includes(h));
  if (!block) return null;
  const row = [...block.children].find((r) => norm((r.children[0] || {}).textContent) === 'image');
  return (row || block).querySelector('img');
}

function fixImage(picture, document, params, root) {
  let img = picture.tagName === 'IMG' ? picture : picture.querySelector('img');
  const base = pageUrl(params);
  let src = img ? img.getAttribute('src') || '' : '';
  // Lazy images: the <img> holds a data: placeholder, and helix-importer's preProcess drops
  // such <img>s before transform, so the <picture> often arrives with no <img> at all.
  if (!img || !src || src.startsWith('data:')) {
    const match = plainImage(root, img ? img.getAttribute('alt') || '' : '', params);
    src = match ? match.getAttribute('src') : '';
    if (!src) return null;
    // animated GIFs: use the original media file (the optimized rendition is downscaled)
    if (/\.gif(\?|$)/i.test(src)) src = src.replace(/\?.*$/, '');
    const fresh = document.createElement('img');
    fresh.setAttribute('src', src);
    fresh.setAttribute('alt', (img && img.getAttribute('alt')) || match.getAttribute('alt') || '');
    img = fresh;
    picture = fresh;
  }
  if (base && !/^https?:/.test(src)) {
    try { src = new URL(src, base).href; } catch (e) { /* keep as-is */ }
  }
  if (src !== img.getAttribute('src')) img.setAttribute('src', src);
  return picture;
}

export default function parse(element, { document, params }) {
  const root = element.querySelector(`:scope > ${ROOT_SEL.split(', ').join(', :scope > ')}`)
    || (element.matches(ROOT_SEL) ? element : element.querySelector(ROOT_SEL))
    || element;

  const own = (sel) => [...root.querySelectorAll(sel)]
    .filter((el) => el.closest(ROOT_SEL) === root || root === element);

  // Image cell: desktop picture of the default (light) set; never the dark-mode relief copy
  const imageContainer = own('.image-container')[0];
  let picture = null;
  if (imageContainer) {
    const candidates = [...imageContainer.querySelectorAll('.image-1-2-desktop-image picture, .image-1-1-desktop-image picture, .desktop-image picture')]
      .concat([...imageContainer.querySelectorAll('picture')], [...imageContainer.querySelectorAll('img')])
      .filter((el) => !el.closest('.image-relief'));
    picture = candidates[0] || null;
    if (picture) picture = fixImage(picture, document, params, root);
  }

  // Text cell
  const content = own('.content-container')[0];
  const textCell = [];
  if (content) {
    content.querySelectorAll('.image-content-eyebrow-container p').forEach((p) => {
      if (p.textContent.trim()) textCell.push(p);
    });
    const heading = content.querySelector('.image-content-headline-container h1, .image-content-headline-container h2, .image-content-headline-container h3')
      || content.querySelector('h2, h3');
    if (heading) textCell.push(heading);
    content.querySelectorAll('.image-content-body-container p, .image-content-label-container p')
      .forEach((p) => textCell.push(p));
    // CTA emphasis follows decorateButtons (scripts/aem.js) + styles/styles.css:
    //   a.button.primary (filled)      -> plain link alone in its paragraph (default button,
    //                                     same filled look; keeps the homepage output unchanged)
    //   a.button.secondary (outlined)  -> <p><em><a></em></p> (button secondary = outlined pill)
    //   a.button.text (underlined link)-> ***[label](href)*** (round-trips as <p><em><strong><a>):
    //                                     the link's parent <strong> sits in <em>, not <p>, so no
    //                                     decorateButtons rule matches and it stays a text link;
    //                                     the block treats the all-<em> paragraph as small print
    //                                     (small, bold, underlined, non-italic)
    content.querySelectorAll('.button-group a[href], p.button-container a[href]')
      .forEach((a) => {
        if (textCell.some((el) => el.contains(a))) return;
        const p = document.createElement('p');
        if (a.classList.contains('secondary')) {
          const em = document.createElement('em');
          em.append(a);
          p.append(em);
        } else if (a.classList.contains('text')) {
          const strong = document.createElement('strong');
          const em = document.createElement('em');
          em.append(a);
          strong.append(em);
          p.append(strong);
        } else {
          p.append(a);
        }
        textCell.push(p);
      });
  }

  if (!picture && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const imageCell = picture || '';
  const text = textCell.length ? textCell : '';
  const textFirst = root.classList.contains('desktop-right');
  const cells = [textFirst ? [text, imageCell] : [imageCell, text]];

  // Options (blocks/columns-media/README.md): image-1-1 -> full-bleed; italic-text -> italic
  const variants = [];
  if (root.classList.contains('image-1-1')) variants.push('full-bleed');
  if (root.classList.contains('italic-text')) variants.push('italic');
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', variants, cells });
  element.replaceWith(block);
}
