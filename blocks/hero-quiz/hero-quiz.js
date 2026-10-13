import { createTag } from '../../scripts/shared.js';

/* same key the quiz (assessment) writes its results to */
const STORAGE_KEY = 'quiz-results';

/**
 * @returns {boolean} true when this visitor already has quiz results in this session
 */
function hasQuizResults() {
  try {
    return !!window.sessionStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return false;
  }
}

/**
 * A paragraph that is a button (decorated by decorateButtons) or holds only a link.
 * @param {Element} el
 * @returns {boolean}
 */
function isButton(el) {
  if (el.classList.contains('button-container')) return true;
  const a = el.tagName === 'P' && el.querySelector('a');
  return !!a && el.textContent.trim() === a.textContent.trim();
}

/**
 * All element children of a row's cells, in order.
 * @param {Element} row
 * @returns {Element[]}
 */
function rowContent(row) {
  return [...row.children].flatMap((cell) => [...cell.children]);
}

/**
 * Hero (quiz): centered quiz-launch card - eyebrow, heading, subtitle, primary CTA and a
 * short note (e.g. ":clock: 30 seconds").
 * Content:
 * - row 1, 1 cell: optional eyebrow paragraph(s), heading (h1), subtitle paragraph(s),
 *   CTA link(s), note paragraph(s) after the CTA (or any paragraph with an icon)
 * - row 2 (optional), 1 cell: alternate CTA links for returning visitors; shown instead of the
 *   row 1 CTAs when sessionStorage holds quiz results
 * @param {Element} block
 */
export default function decorate(block) {
  const [mainRow, ...returningRows] = [...block.children];
  if (!mainRow) return;

  const card = createTag('div', { class: 'hero-quiz-card' });
  const eyebrow = createTag('div', { class: 'hero-quiz-eyebrow' });
  const body = createTag('div', { class: 'hero-quiz-body' });
  const actions = createTag('div', { class: 'hero-quiz-actions' });
  const note = createTag('div', { class: 'hero-quiz-note' });

  const content = rowContent(mainRow);
  const heading = content.find((el) => /^H[1-6]$/.test(el.tagName));
  let seenHeading = !heading;
  content.forEach((el) => {
    if (el === heading) {
      seenHeading = true;
      return;
    }
    if (!seenHeading) eyebrow.append(el);
    else if (isButton(el)) actions.append(el);
    else if (actions.children.length || el.querySelector('.icon')) note.append(el);
    else body.append(el);
  });

  const returning = createTag('div', { class: 'hero-quiz-actions hero-quiz-returning' });
  returningRows.forEach((row) => returning.append(...rowContent(row)));

  if (eyebrow.children.length) card.append(eyebrow);
  if (heading) card.append(heading);
  if (body.children.length) card.append(body);
  if (actions.children.length) card.append(actions);
  if (returning.children.length) {
    card.append(returning);
    const back = hasQuizResults();
    returning.hidden = !back;
    actions.hidden = back && actions.children.length > 0;
  }
  if (note.children.length) card.append(note);

  block.replaceChildren(card);
}
