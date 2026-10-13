import { createTag } from '../../scripts/shared.js';

/**
 * True when the link points to another host (absolute URL off this site).
 * @param {HTMLAnchorElement} a
 */
function isExternal(a) {
  try {
    return new URL(a.href, window.location.href).hostname !== window.location.hostname;
  } catch (e) {
    return false;
  }
}

/**
 * Builds the answer panel: body copy first, then the stacked CTA links.
 * A single CTA renders as an outlined small button; two or more render as
 * underlined text links (matches the source design).
 * @param {Element[]} cells
 */
function buildAnswer(cells) {
  const body = createTag('div', { class: 'accordion-faq-body' });
  cells.forEach((cell) => body.append(...cell.childNodes));

  const ctas = [...body.querySelectorAll(':scope > .button-container')];
  const answer = createTag('div', { class: 'accordion-faq-answer' }, body);
  if (!ctas.length) return answer;

  const actions = createTag('div', { class: 'accordion-faq-actions' }, ctas);
  const variant = ctas.length > 1 ? 'tertiary' : 'secondary';
  actions.querySelectorAll('a.button').forEach((a) => {
    a.classList.remove('primary');
    a.classList.add(variant, 'button-sm');
    if (variant === 'tertiary' && isExternal(a)) a.classList.add('external');
  });
  if (!body.childNodes.length) body.remove();
  answer.append(actions);
  return answer;
}

/**
 * Accordion (FAQ): each row is a question | answer pair rendered as a native
 * <details>/<summary> disclosure (keyboard and screen-reader support built in).
 * Several items may be open at once. Extra cells after the question are merged
 * into the answer.
 * @param {Element} block
 */
export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const [questionCell, ...answerCells] = [...row.children];
    if (!questionCell) return null;

    // unwrap a single paragraph so the summary holds phrasing content only
    const only = questionCell.children.length === 1 ? questionCell.firstElementChild : null;
    const source = only && /^(P|H[1-6])$/.test(only.tagName) ? only : questionCell;
    const label = createTag('span', { class: 'accordion-faq-label' });
    label.append(...source.childNodes);
    const icon = createTag('span', { class: 'accordion-faq-icon', 'aria-hidden': 'true' });
    const summary = createTag('summary', { class: 'accordion-faq-question' }, [label, icon]);

    return createTag('details', { class: 'accordion-faq-item' }, [summary, buildAnswer(answerCells)]);
  }).filter(Boolean);

  block.replaceChildren(...items);
}
