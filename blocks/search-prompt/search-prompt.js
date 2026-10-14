import { createTag } from '../../scripts/shared.js';

const QUERY_PARAM = 'q';

/**
 * Search (prompt): a search field that sends the visitor to the search results page.
 * Content: one row with
 *   - a paragraph of placeholder text (e.g. Try "Migraine Treatment"), also used as the
 *     field's accessible name;
 *   - a link to the search results page — its text is the button label, its href the target.
 * The query is submitted as `?q=<term>`, like the header search.
 * @param {Element} block
 */
export default function decorate(block) {
  const link = block.querySelector('a[href]');
  // placeholder: first paragraph (or bare-text cell) that is not the link
  const placeholderEl = [...block.querySelectorAll('p'), ...block.querySelectorAll(':scope > div > div')]
    .find((el) => !el.querySelector('a') && el.textContent.trim());
  const placeholder = placeholderEl?.textContent.trim() || '';
  const buttonLabel = link?.textContent.trim() || '';

  if (!link) {
    // without a target there is nothing to submit to; keep the authored text visible
    return;
  }

  const target = new URL(link.href, window.location.href);
  const form = createTag('form', {
    class: 'search-prompt-form',
    role: 'search',
    method: 'get',
    action: `${target.origin}${target.pathname}`,
  });

  // keep any extra parameters authored on the link (except the query itself)
  target.searchParams.forEach((value, name) => {
    if (name !== QUERY_PARAM) form.append(createTag('input', { type: 'hidden', name, value }));
  });

  const field = createTag('div', { class: 'search-prompt-field' });
  const input = createTag('input', {
    class: 'search-prompt-input',
    type: 'search',
    name: QUERY_PARAM,
    placeholder,
    'aria-label': placeholder || buttonLabel,
    autocomplete: 'off',
    enterkeyhint: 'search',
  });
  field.append(createTag('span', { class: 'search-prompt-icon', 'aria-hidden': 'true' }), input);

  const submit = createTag('button', { type: 'submit', class: 'button primary button-sm search-prompt-submit' }, buttonLabel);

  form.append(field, submit);
  block.replaceChildren(form);
}
