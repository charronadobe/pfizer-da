import { createTag } from '../../scripts/shared.js';

let quizCount = 0;

/**
 * Quiz (choice reveal): option tiles; choosing one reveals its authored answer.
 * Each answer panel follows its option tile in the DOM, so on mobile it opens inline
 * under the chosen tile; on desktop CSS moves it below the tile grid.
 * Choosing the selected option again closes its answer.
 * Content (all authored, nothing fetched):
 * - optional intro row(s), one cell: heading / text (the question)
 * - one row per option, 2 cells: option label | answer content (paragraphs, links, CTA)
 * - optional trailing row(s), one cell: content shown below every answer
 * @param {Element} block
 */
export default function decorate(block) {
  quizCount += 1;
  const id = `quiz-choice-${quizCount}`;
  const intro = createTag('div', { class: 'quiz-choice-intro' });
  const common = [];
  const options = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2 && cells[0].textContent.trim()) {
      options.push({ label: cells[0].textContent.trim(), answer: cells.slice(1) });
    } else if (cells.length === 1 && cells[0].textContent.trim()) {
      if (options.length) common.push(cells[0]);
      else intro.append(...cells[0].childNodes);
    }
  });

  const heading = intro.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.id = heading.id || `${id}-heading`;

  const group = createTag('div', { class: 'quiz-choice-options', role: 'group', 'aria-live': 'polite' });
  if (heading) group.setAttribute('aria-labelledby', heading.id);

  const items = options.map((option, idx) => {
    const panelId = `${id}-answer-${idx}`;
    const panel = createTag('div', { class: 'quiz-choice-answer', id: panelId, hidden: '' });
    option.answer.forEach((cell) => panel.append(...cell.childNodes));
    common.forEach((cell) => panel.append(...[...cell.children].map((el) => el.cloneNode(true))));
    panel.querySelectorAll('a.button').forEach((a) => a.classList.add('button-sm'));

    const button = createTag('button', {
      type: 'button',
      class: 'quiz-choice-option',
      'aria-pressed': 'false',
      'aria-controls': panelId,
    }, option.label);
    group.append(button, panel);
    return { button, panel };
  });

  items.forEach(({ button, panel }) => {
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-pressed') !== 'true';
      items.forEach((item) => {
        const selected = open && item.button === button;
        item.button.setAttribute('aria-pressed', String(selected));
        item.panel.hidden = !selected;
      });
      block.classList.toggle('is-answered', open);
      if (open) panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  });

  block.replaceChildren(...(intro.childNodes.length ? [intro] : []), group);
}
