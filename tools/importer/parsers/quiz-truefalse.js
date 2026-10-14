/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quiz-truefalse. Base: quiz (custom).
 * Source: content-page template (/vaccines/ .true-false, /find-care/biomarker-testing/ .question-1-2)
 * Selectors: #main > div.section.true-false-container .true-false.block
 *            #main > div.section.question-1-2-container .question-1-2.block
 * Generated: 2026-10-13
 *
 * Output (blocks/quiz-truefalse/quiz-truefalse.js):
 *   Row 1 (1 cell): eyebrow paragraph, h2 statement, optional italic source paragraph
 *   One row per answer (3 cells): label | feedback (h3 result heading [+ body + CTA]) |
 *     "Correct" in the 3rd cell for the correct answer, empty otherwise
 *   Optional last row (1 cell): explanation + CTA, used when both answers share the
 *     same body/CTA (biomarker); otherwise the body/CTA stay in each answer's feedback
 *     (vaccines: the "False" body starts with "Correct answer: ...").
 *
 * Source structure (validated against block-context/quiz-truefalse/instance-1..2):
 *   .true-false|.question-1-2 .block
 *     ...-eyebrow-container p, ...-headline-container h2, .true-false-label-container p > em
 *     ...-action-container button ...-answer-text   (True / False)
 *     ...-result-card                               (EMPTY until an answer is clicked)
 * The correct answer and per-answer feedback are not in the rendered DOM: the site's
 * block JS renders them on click from its authored config (verified live: "False" on
 * /vaccines/ renders `incorrect_heading` + `incorrect_body` + `cta_incorrect`; "True" on
 * biomarker renders `correct_heading`). The parser reads that authored config from the
 * page's EDS source markup (same-origin .plain.html: rows eyebrow, question, label,
 * correct_answer, [incorrect_answer], correct_/incorrect_ heading, body, cta), matched
 * by the statement text. Nothing is hard-coded; if the source markup is unavailable,
 * the labels come from the buttons and no feedback/correct marker is emitted.
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

function readConfig(blockEl) {
  const cfg = {};
  [...blockEl.children].forEach((row) => {
    const [k, v] = [...row.children];
    if (k && v) cfg[clean(k.textContent).toLowerCase()] = v;
  });
  return cfg;
}

function authoredConfig(element, blockClass, questionText, params) {
  const plain = loadPlain(params);
  if (!plain) return null;
  const configs = [...plain.querySelectorAll(`div.${blockClass}`)].map(readConfig);
  if (!configs.length) return null;
  const q = clean(questionText).toLowerCase();
  let match = configs.find((c) => c.question && clean(c.question.textContent).toLowerCase() === q);
  if (!match) {
    const idx = [...element.ownerDocument.querySelectorAll(`.${blockClass}.block`)].indexOf(element);
    match = configs[idx >= 0 ? idx : 0];
  }
  return match;
}

/** Import authored cell content: block children, or a bare inline value wrapped in <p>. */
function importContent(cell, document) {
  if (!cell) return [];
  const out = [];
  const kids = [...cell.childNodes].filter((n) => n.nodeType === 1 || clean(n.textContent));
  const blockLevel = kids.every((n) => n.nodeType === 1 && /^(P|H[1-6]|UL|OL|DIV)$/.test(n.tagName));
  if (!blockLevel) {
    const p = document.createElement('p');
    kids.forEach((n) => p.append(document.importNode(n, true)));
    if (clean(p.textContent)) out.push(p);
  } else {
    kids.forEach((n) => out.push(document.importNode(n, true)));
  }
  // link-only paragraphs (<p><strong><a>..</a></strong></p>, <p><a>..</a></p>) -> <p><a>..</a></p>
  out.forEach((node) => {
    if (node.tagName !== 'P') return;
    const a = node.querySelector('a[href]');
    if (a && clean(node.textContent) === clean(a.textContent)) {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = clean(a.textContent);
      node.replaceChildren(link);
    }
  });
  return out;
}

const serialize = (nodes) => nodes.map((n) => n.outerHTML).join('');

export default function parse(element, { document, params }) {
  const blockClass = element.classList.contains('question-1-2') ? 'question-1-2'
    : (element.classList.contains('true-false') ? 'true-false' : [...element.classList][0]);

  const eyebrow = element.querySelector('[class*="eyebrow-container"] p');
  const heading = element.querySelector('[class*="headline-container"] h2:not([class*="result"]), [class*="headline-container"] h3:not([class*="result"])');
  const source = [...element.querySelectorAll('[class*="label-container"] p')].filter((p) => clean(p.textContent));
  const buttonLabels = [...element.querySelectorAll('[class*="action-container"] button')]
    .map((b) => clean((b.querySelector('[class*="answer-text"]') || b).textContent))
    .filter(Boolean);

  if (!heading && !buttonLabels.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cfg = authoredConfig(element, blockClass, heading ? heading.textContent : '', params);

  // Row 1: eyebrow, statement, source line
  const intro = [];
  if (eyebrow && clean(eyebrow.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(eyebrow.textContent);
    intro.push(p);
  }
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = clean(heading.textContent);
    intro.push(h2);
  }
  source.forEach((p) => {
    const out = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = clean(p.textContent);
    out.append(em);
    intro.push(out);
  });
  const cells = [[intro]];

  // Answer rows
  const correctLabel = cfg && cfg.correct_answer ? clean(cfg.correct_answer.textContent) : '';
  const labels = buttonLabels.length ? buttonLabels
    : [correctLabel, cfg && cfg.incorrect_answer ? clean(cfg.incorrect_answer.textContent) : ''].filter(Boolean);

  const feedbackFor = (kind) => {
    if (!cfg) return { heading: [], body: [], cta: [] };
    const h = cfg[`${kind}_heading`];
    const headingEl = [];
    if (h && clean(h.textContent)) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(h.textContent);
      headingEl.push(h3);
    }
    return {
      heading: headingEl,
      body: importContent(cfg[`${kind}_body`], document),
      cta: importContent(cfg[`cta_${kind}`], document),
    };
  };
  const right = feedbackFor('correct');
  const wrong = feedbackFor('incorrect');
  const shared = cfg && serialize(right.body) === serialize(wrong.body) && serialize(right.cta) === serialize(wrong.cta)
    && (right.body.length || right.cta.length);

  labels.forEach((label) => {
    const isCorrect = !!correctLabel && label.toLowerCase() === correctLabel.toLowerCase();
    const fb = isCorrect ? right : wrong;
    const feedback = shared ? [...fb.heading] : [...fb.heading, ...fb.body, ...fb.cta];
    cells.push([label, feedback.length ? feedback : '', isCorrect ? 'Correct' : '']);
  });

  if (shared) cells.push([[...right.body, ...right.cta]]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'quiz-truefalse', cells });
  element.replaceWith(block);
}
