import { createTag } from '../../scripts/shared.js';

let quizCount = 0;

/**
 * Quiz (true/false): a statement with answer buttons; answering reveals authored feedback.
 * Content (all authored, nothing fetched):
 * - row 1, one cell: eyebrow paragraph, statement heading (h2), optional italic source line
 * - one row per answer: answer label (e.g. "True") | feedback for that answer
 *   (e.g. "That's correct!") | optional third cell: any text marks the correct answer
 * - optional last row, one cell: result content shown after any answer (explanation, CTA)
 * @param {Element} block
 */
export default function decorate(block) {
  quizCount += 1;
  const id = `quiz-truefalse-${quizCount}`;
  const question = createTag('div', { class: 'quiz-truefalse-question' });
  const shared = createTag('div', { class: 'quiz-truefalse-explanation' });
  const answers = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2 && cells[0].textContent.trim()) {
      answers.push({
        label: cells[0].textContent.trim(),
        feedback: cells[1],
        correct: !!cells[2]?.textContent.trim(),
      });
    } else if (cells.length === 1 && (cells[0].textContent.trim() || cells[0].querySelector('picture'))) {
      (answers.length ? shared : question).append(...cells[0].childNodes);
    }
  });

  const heading = question.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.id = heading.id || `${id}-heading`;
    // paragraphs before the statement are the eyebrow, italic-only ones after it the source
    let el = heading.previousElementSibling;
    while (el) {
      if (el.tagName === 'P') el.classList.add('quiz-truefalse-eyebrow');
      el = el.previousElementSibling;
    }
  }
  question.querySelectorAll(':scope > p').forEach((p) => {
    const em = p.firstElementChild;
    if (p.children.length === 1 && em.tagName === 'EM' && p.textContent.trim() === em.textContent.trim()) {
      p.classList.add('quiz-truefalse-source');
    }
  });

  const group = createTag('div', { class: 'quiz-truefalse-answers', role: 'group' });
  if (heading) group.setAttribute('aria-labelledby', heading.id);

  const result = createTag('div', {
    class: 'quiz-truefalse-result',
    id: `${id}-result`,
    hidden: '',
  });
  const live = createTag('div', { class: 'quiz-truefalse-live', 'aria-live': 'polite' }, result);

  const feedbackPanels = answers.map((answer) => {
    const panel = createTag('div', { class: 'quiz-truefalse-feedback', hidden: '' });
    panel.append(...answer.feedback.childNodes);
    result.append(panel);
    return panel;
  });
  if (shared.childNodes.length) result.append(shared);

  // result CTAs render as small outlined pills; off-site ones carry an external-link glyph
  result.querySelectorAll('a.button').forEach((link) => {
    link.classList.add('secondary', 'button-sm');
    try {
      if (new URL(link.href, window.location.href).origin !== window.location.origin) {
        link.classList.add('quiz-truefalse-external');
        link.rel = 'noopener';
      }
    } catch {
      // ignore malformed URLs
    }
  });

  const hasCorrect = answers.some((a) => a.correct);
  const buttons = answers.map((answer, idx) => {
    const button = createTag('button', {
      type: 'button',
      class: 'quiz-truefalse-answer',
      'aria-pressed': 'false',
      'aria-controls': result.id,
    }, answer.label);
    // answers stay changeable (as on the source); the live region announces each result
    button.addEventListener('click', () => {
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === idx)));
      feedbackPanels.forEach((panel, i) => { panel.hidden = i !== idx; });
      if (hasCorrect) {
        result.classList.toggle('is-correct', answer.correct);
        result.classList.toggle('is-incorrect', !answer.correct);
      }
      result.hidden = false;
      block.classList.add('quiz-truefalse-answered');
    });
    group.append(button);
    return button;
  });

  block.replaceChildren(question, group, live);
}
