/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-quiz. Base: hero.
 * Source: https://www.pfizerforall.com/find-care/cancer-screening/
 * Selector: #main > div.section.oncology-quiz-card-container .oncology-quiz-card.block
 * Generated: 2026-10-13
 *
 * Output follows the project block (blocks/hero-quiz/hero-quiz.js), not the generic hero
 * image row: this hero has no image, so there is no background-image row.
 *   Row 1, 1 cell: eyebrow paragraph, h1 (headline only), subtitle paragraph(s),
 *          <p><strong><a>primary CTA</a></strong></p>, note paragraph (clock icon + text)
 *   Row 2 (optional), 1 cell: returning-visitor CTAs - <p><strong><a>Retake</a></strong></p>,
 *          <p><em><a>Return to guide</a></em></p> (hidden in the source DOM, still present)
 *
 * Source structure (validated against block-context/hero-quiz/cancer-screening-instance.html):
 *   .oncology-quiz-card.block
 *     h1.oncology-quiz-card-title > strong > u (eyebrow text) + headline text node
 *       (at parse time: h1 > u + text, the importer has already dropped the <strong>)
 *     .oncology-quiz-card-bottom-container
 *       p.oncology-quiz-card-subtitle > p (nested <p> in the live DOM; an HTML re-parse
 *         flattens it into sibling paragraphs - both shapes handled)
 *       .oncology-quiz-card-button-group
 *         .button-started-wrapper p.button-container a.button     (primary CTA)
 *         .button-retake-wrapper.hidden a.button                  (returning: retake)
 *         .button-return-wrapper.hidden a.button                  (returning: back to guide)
 *       .oncology-quiz-card-timer span.icon.icon-clock + p        (note)
 *     .oncology-quiz-card-content (empty)
 * The sprite icon is replaced by the site's served file /assets/icons/{name}.svg; the
 * query string keeps helix-importer from rewriting it to :icon: notation (no /icons folder).
 * Hrefs are kept as authored (the cleanup transformer may already have rewritten them).
 */
const ORIGIN = 'https://www.pfizerforall.com';
const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

function iconImage(container, document) {
  const span = container && container.querySelector('span.icon');
  const cls = span && [...span.classList].find((c) => c.startsWith('icon-'));
  if (!cls) return null;
  // site icon loader strips an `asset-` prefix: icon-asset-pill-bottle -> pill-bottle.svg
  const name = cls.replace(/^icon-/, '').replace(/^asset-/, '');
  const img = document.createElement('img');
  img.src = `${ORIGIN}/assets/icons/${name}.svg?format=svg`;
  img.alt = '';
  return img;
}

/** <p><wrapTag><a href>label</a></wrapTag></p> built from a source button link. */
function ctaParagraph(a, wrapTag, document) {
  if (!a) return null;
  const label = clean((a.querySelector('.span-button-text-variant') || a).textContent) || clean(a.getAttribute('title'));
  const href = a.getAttribute('href');
  if (!label || !href) return null;
  const link = document.createElement('a');
  link.setAttribute('href', href);
  link.textContent = label;
  const wrap = document.createElement(wrapTag);
  wrap.append(link);
  const p = document.createElement('p');
  p.append(wrap);
  return p;
}

export default function parse(element, { document }) {
  const h1 = element.querySelector('h1, .oncology-quiz-card-title');
  const bottom = element.querySelector('.oncology-quiz-card-bottom-container') || element;
  const group = bottom.querySelector('.oncology-quiz-card-button-group');
  const timer = bottom.querySelector('.oncology-quiz-card-timer');

  // Eyebrow: the bold/underlined run inside the source h1; headline: the rest.
  // The live h1 is <strong><u>EYEBROW</u></strong> HEADLINE, but helix-importer's
  // preProcess (DOMUtils.reviewHeadings, run before transform) strips every <strong>
  // inside headings, so by the time this parser runs only <u>EYEBROW</u> is left.
  // Accept any leading inline-emphasis wrapper (strong/b/u/em/i).
  let eyebrow = null;
  let heading = null;
  if (h1) {
    const copy = h1.cloneNode(true);
    const first = [...copy.childNodes].find((n) => n.nodeType !== 3 || clean(n.textContent));
    const emph = first && first.nodeType === 1 && /^(STRONG|B|U|EM|I)$/.test(first.tagName) ? first : null;
    if (emph && clean(emph.textContent)) {
      // keep the bold; the underline is source styling (raw <u> does not survive markdown)
      const strong = document.createElement('strong');
      strong.textContent = clean(emph.textContent);
      eyebrow = document.createElement('p');
      eyebrow.append(strong);
      emph.remove();
    }
    heading = document.createElement('h1');
    heading.textContent = clean(copy.textContent);
    if (!heading.textContent) heading = null;
  }

  // Subtitle: leaf paragraphs in the bottom container outside the buttons and timer.
  const subtitle = [...bottom.querySelectorAll('p')]
    .filter((p) => !(group && group.contains(p)) && !(timer && timer.contains(p)))
    .filter((p) => !p.querySelector('p') && clean(p.textContent))
    .map((p) => {
      const out = document.createElement('p');
      out.innerHTML = p.innerHTML;
      return out;
    });

  // CTAs
  const root = group || bottom;
  const primary = root.querySelector('.button-started-wrapper a[href]')
    || [...root.querySelectorAll('a[href]')].find((a) => !a.closest('.button-retake-wrapper, .button-return-wrapper'));
  const retake = root.querySelector('.button-retake-wrapper a[href]');
  const back = root.querySelector('.button-return-wrapper a[href]');

  // Note: clock icon + text
  let note = null;
  if (timer && clean(timer.textContent)) {
    note = document.createElement('p');
    const icon = iconImage(timer, document);
    if (icon) note.append(icon, document.createTextNode(' '));
    note.append(document.createTextNode(clean(timer.textContent)));
  }

  const main = [eyebrow, heading, ...subtitle, ctaParagraph(primary, 'strong', document), note].filter(Boolean);
  if (!heading && !main.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[main]];
  const returning = [ctaParagraph(retake, 'strong', document), ctaParagraph(back, 'em', document)].filter(Boolean);
  if (returning.length) cells.push([returning]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-quiz', cells });
  element.replaceWith(block);
}
