/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quiz-choice. Base: quiz (custom).
 * Source: https://www.pfizerforall.com/vaccines/
 * Selector: #main > div.section.question-1-6-container .question-1-6.block
 * Generated: 2026-10-13
 *
 * Output (blocks/quiz-choice/quiz-choice.js):
 *   Row 1 (1 cell): intro h2 (the question)
 *   One row per option (2 cells): option label | answer content (h3, paragraph(s), CTA link)
 *
 * Source structure (validated against block-context/quiz-choice/instance-1.html):
 *   .question-1-6.block
 *     .question-1-6-content-headline-container h2
 *     .question-tile-grid > button.tile p.tile-label        (option labels)
 *     .question-answer-container                            (EMPTY until a tile is clicked)
 * The answers are not in the rendered DOM: the site's block JS renders them from its
 * authored block config on click (verified live: clicking tile 1 renders exactly
 * `answer1`). The parser therefore reads the authored config from the page's EDS
 * source markup (same-origin .plain.html, rows `question`, `optionN`, `answerN`),
 * matched to this block by its question text. Nothing is hard-coded. If the source
 * markup cannot be read, labels come from the tiles and any rendered answer is used.
 */
let plainCache;
/** Synchronously load the page's EDS .plain.html (same origin) once. */
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

/** Authored key/value rows of an EDS block: { key: valueCell } (keys lower-cased). */
function readConfig(blockEl) {
  const cfg = {};
  [...blockEl.children].forEach((row) => {
    const [k, v] = [...row.children];
    if (k && v) cfg[clean(k.textContent).toLowerCase()] = v;
  });
  return cfg;
}

/** Find this block's authored config in the .plain.html (match by question text, then by index). */
function authoredConfig(element, blockClass, questionText, params) {
  const plain = loadPlain(params);
  if (!plain) return null;
  const blocks = [...plain.querySelectorAll(`div.${blockClass}`)];
  if (!blocks.length) return null;
  const configs = blocks.map(readConfig);
  const q = clean(questionText).toLowerCase();
  let match = configs.find((c) => c.question && clean(c.question.textContent).toLowerCase() === q);
  if (!match) {
    const doc = element.ownerDocument;
    const idx = [...doc.querySelectorAll(`.${blockClass}.block`)].indexOf(element);
    match = configs[idx >= 0 ? idx : 0];
  }
  return match;
}

/** Copy authored answer content into the importer document, normalizing CTA/headings. */
function importContent(cell, document) {
  const out = [];
  [...cell.children].forEach((el) => {
    const node = document.importNode(el, true);
    if (/^H[1-6]$/.test(node.tagName)) {
      node.querySelectorAll('strong, b').forEach((s) => s.replaceWith(...s.childNodes));
      node.removeAttribute('id');
    }
    // <p><em><strong><a>CTA</a></strong></em></p> -> <p><a>CTA</a></p>
    if (node.tagName === 'P') {
      const a = node.querySelector('a[href]');
      if (a && clean(node.textContent) === clean(a.textContent)) {
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = clean(a.textContent);
        node.replaceChildren(link);
      }
    }
    out.push(node);
  });
  if (!out.length && clean(cell.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(cell.textContent);
    out.push(p);
  }
  return out;
}

export default function parse(element, { document, params }) {
  const heading = element.querySelector('.question-1-6-content-headline-container h2, .question-1-6-content-headline-container h3')
    || element.querySelector('h2, h3');
  const labels = [...element.querySelectorAll('.question-tile-grid button.tile, .question-tiles-container button.tile')]
    .filter((b, i, arr) => arr.indexOf(b) === i)
    .map((b) => clean((b.querySelector('.tile-label') || b).textContent))
    .filter(Boolean);

  const cfg = authoredConfig(element, 'question-1-6', heading ? heading.textContent : '', params);

  const cells = [];
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = clean(heading.textContent);
    cells.push([h2]);
  } else if (cfg && cfg.question) {
    const h2 = document.createElement('h2');
    h2.textContent = clean(cfg.question.textContent);
    cells.push([h2]);
  }

  // options: authored optionN / answerN pairs, falling back to the rendered tile labels
  const options = [];
  if (cfg) {
    Object.keys(cfg).filter((k) => /^option\d+$/.test(k))
      .sort((a, b) => parseInt(a.slice(6), 10) - parseInt(b.slice(6), 10))
      .forEach((k) => {
        const n = k.slice(6);
        options.push({ label: clean(cfg[k].textContent), answer: cfg[`answer${n}`] ? importContent(cfg[`answer${n}`], document) : [] });
      });
  }
  if (!options.length) {
    const rendered = [...element.querySelectorAll('.question-answer-container .question-answer-type-stack > *, .question-answer-container .question-answer-button-wrapper a[href]')];
    labels.forEach((label, i) => options.push({ label, answer: i === 0 ? rendered : [] }));
  }

  options.forEach(({ label, answer }) => {
    if (!label) return;
    cells.push([label, answer.length ? answer : '']);
  });

  if (!options.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'quiz-choice', cells });
  element.replaceWith(block);
}
