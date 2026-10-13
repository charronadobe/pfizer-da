import { createTag, fetchPlaceholders } from '../../scripts/shared.js';

let quizCount = 0;

/**
 * Quiz (entry launcher): one question with selectable chips; "continue" goes to the chosen
 * option's URL.
 * Content (all authored):
 * - row 1, one cell: question heading (h3), optional intro text
 * - one row per option, 2 cells: option label | link (destination URL)
 *   (a single linked cell also works: link text = label)
 * - last row, one cell: continue button label (first paragraph or link text), optional note
 *   (e.g. ":clock: Complete in 1 min")
 * @param {Element} block
 */
export default function decorate(block) {
  quizCount += 1;
  const id = `quiz-entry-${quizCount}`;
  const question = createTag('div', { class: 'quiz-entry-question' });
  const footer = [];
  const options = [];

  const rows = [...block.children];
  rows.forEach((row, idx) => {
    const cells = [...row.children];
    const link = row.querySelector('a[href]');
    if (cells.length >= 2 && cells[0].textContent.trim()) {
      options.push({ label: cells[0].textContent.trim(), href: link?.href || '' });
    } else if (cells.length === 1 && cells[0].textContent.trim()) {
      const cell = cells[0];
      const onlyLink = link && cell.textContent.trim() === link.textContent.trim();
      // a lone link row is an option, except the last row (the continue button)
      if (onlyLink && idx > 0 && idx < rows.length - 1 && !cell.querySelector('h1, h2, h3, h4, h5, h6')) {
        options.push({ label: link.textContent.trim(), href: link.href });
      } else if (options.length) {
        footer.push(...cell.children);
      } else {
        question.append(...cell.childNodes);
      }
    }
  });

  const headings = [...question.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  const legendSource = headings[headings.length - 1];

  const fieldset = createTag('fieldset', { class: 'quiz-entry-options' });
  if (legendSource) {
    // the question heading becomes the radio group's legend (keeps the heading level)
    const legend = createTag('legend', { class: 'quiz-entry-legend' });
    legendSource.replaceWith(legend);
    legend.append(legendSource);
    fieldset.append(legend);
  }
  const intro = question.childNodes.length ? question : null;

  const radios = options.map((option, idx) => {
    const inputId = `${id}-option-${idx}`;
    const input = createTag('input', {
      type: 'radio', id: inputId, name: id, value: option.href, class: 'quiz-entry-radio',
    });
    fieldset.append(createTag('div', { class: 'quiz-entry-option' }, [
      input,
      createTag('label', { for: inputId }, option.label),
    ]));
    return input;
  });

  // footer: first paragraph / link = button label, the rest is a note
  const [labelEl, ...noteEls] = footer;
  const buttonLabel = labelEl?.textContent.trim() || '';
  const button = createTag('button', { type: 'submit', class: 'button primary quiz-entry-continue', disabled: '' }, buttonLabel);
  const actions = createTag('div', { class: 'quiz-entry-actions' }, button);
  if (noteEls.length) actions.append(createTag('div', { class: 'quiz-entry-note' }, noteEls));

  // no continue label authored: use the localized placeholder
  if (!buttonLabel) {
    fetchPlaceholders().then((ph) => { button.textContent = ph.continue || 'Continue'; });
  }

  const form = createTag('form', { class: 'quiz-entry-form' }, [fieldset, actions]);
  radios.forEach((radio) => radio.addEventListener('change', () => {
    button.disabled = !radios.some((r) => r.checked && r.value);
  }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const chosen = radios.find((r) => r.checked);
    if (chosen?.value) window.location.assign(chosen.value);
  });

  block.replaceChildren(...(intro ? [intro] : []), form);
}
