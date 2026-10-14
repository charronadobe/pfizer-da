/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quiz-entry. Base: quiz (custom).
 * Source: https://www.pfizerforall.com/find-care/biomarker-testing/
 * Selector: #main > div.section.entry-quiz-container .entry-quiz.block
 * Generated: 2026-10-13
 *
 * Output (blocks/quiz-entry/quiz-entry.js):
 *   Row 1 (1 cell): question h3
 *   One row per option (2 cells): label | link to the option's destination
 *   Last row (1 cell): continue-button label paragraph + optional note paragraph (clock icon + text)
 *
 * The intro (.intro-section h2 + body paragraph) sits INSIDE the block element, so it is
 * emitted as default content before the block.
 *
 * Source structure (validated against block-context/quiz-entry/instance-1.html):
 *   .entry-quiz.block
 *     .intro-section .headline-container h2, .body-container p
 *     .question-section .question-headline-container h3
 *                       .selection-tiles > .selection-tile .text-label p   (labels; no links)
 *     .buttons-container .button-group button .button__label             (continue label)
 *                        .time-indicator span.icon.icon-clock + p           (note)
 * The option destinations are not in the rendered DOM (tiles are plain divs; the site's
 * JS navigates from its authored config). They are read from the page's EDS source markup
 * (same-origin .plain.html, row `content`: h3 + list of option links), matched by the
 * question text. Without it, options are emitted with labels only.
 */
const ORIGIN = 'https://www.pfizerforall.com';

let plainCache;
function loadPlain(params) {
  if (plainCache !== undefined) return plainCache;
  plainCache = null;
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
          plainCache = new DOMParser().parseFromString(xhr.responseText, 'text/html');
          return plainCache;
        }
      } catch (e) { /* try next */ }
    }
  }
  return plainCache;
}

const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

/** label (lower-case) -> href, from the authored entry-quiz whose content heading matches. */
function authoredLinks(questionText, params) {
  const plain = loadPlain(params);
  const map = {};
  if (!plain) return map;
  const q = clean(questionText).toLowerCase();
  const blocks = [...plain.querySelectorAll('div.entry-quiz')];
  const match = blocks.find((b) => [...b.querySelectorAll('h1, h2, h3, h4')].some((h) => clean(h.textContent).toLowerCase() === q))
    || blocks[0];
  if (!match) return map;
  match.querySelectorAll('li a[href]').forEach((a) => { map[clean(a.textContent).toLowerCase()] = a.getAttribute('href'); });
  return map;
}

export default function parse(element, { document, params }) {
  const intro = [...element.querySelectorAll('.intro-section .headline-container h2, .intro-section .headline-container h3, .intro-section .body-container p')]
    .filter((el) => clean(el.textContent));

  const question = element.querySelector('.question-section .question-headline-container h3, .question-section h3, .question-section h2');
  const labels = [...element.querySelectorAll('.selection-tiles .selection-tile')]
    .map((t) => clean((t.querySelector('.text-label') || t).textContent))
    .filter(Boolean);

  if (!question && !labels.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const links = authoredLinks(question ? question.textContent : '', params);
  const cells = [];
  if (question) {
    const h3 = document.createElement('h3');
    h3.textContent = clean(question.textContent);
    cells.push([h3]);
  }
  labels.forEach((label) => {
    const href = links[label.toLowerCase()];
    let target = '';
    if (href) {
      target = document.createElement('a');
      target.href = href;
      target.textContent = label;
    }
    cells.push([label, target]);
  });

  // footer: continue label + note
  const footer = [];
  const button = element.querySelector('.buttons-container button, .button-group button');
  const buttonLabel = clean(button ? (button.querySelector('.button__label') || button).textContent : '');
  if (buttonLabel) {
    const p = document.createElement('p');
    p.textContent = buttonLabel;
    footer.push(p);
  }
  const note = element.querySelector('.time-indicator');
  if (note && clean(note.textContent)) {
    const p = document.createElement('p');
    const span = note.querySelector('span.icon');
    const name = span && [...span.classList].find((c) => c.startsWith('icon-'));
    if (name) {
      const img = document.createElement('img');
      img.src = `${ORIGIN}/assets/icons/${name.replace(/^icon-/, '')}.svg?format=svg`;
      img.alt = '';
      p.append(img, document.createTextNode(' '));
    }
    p.append(document.createTextNode(clean(note.textContent)));
    footer.push(p);
  }
  if (footer.length) cells.push([footer]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'quiz-entry', cells });
  if (intro.length) element.before(...intro);
  element.replaceWith(block);
}
