import { createTag, fetchPlaceholders } from '../../scripts/shared.js';

const OPTION_CLASSES = ['gradient', 'age-input'];
const MIN_AGE = 18;
const MAX_AGE = 105;
let fieldCount = 0;

/**
 * @param {string} href
 * @returns {boolean} whether the link points off-site
 */
function isExternal(href) {
  try {
    return new URL(href, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Turn the CTA into an inline age field + submit button. The button only shows once a valid
 * age is entered; submitting navigates to the authored CTA link with the age as a query param.
 * @param {HTMLAnchorElement} cta the authored CTA link
 * @param {Element|undefined} configRow optional row: field label | query parameter name
 * @returns {HTMLFormElement}
 */
function buildAgeForm(cta, configRow) {
  fieldCount += 1;
  const id = `banner-cta-field-${fieldCount}`;
  const [labelCell, paramCell] = configRow ? [...configRow.children] : [];
  const labelText = labelCell?.textContent.trim() || cta.textContent.trim();
  const param = paramCell?.textContent.trim() || 'age';
  const external = isExternal(cta.href);

  const label = createTag('label', { for: id, class: 'banner-cta-label' }, labelText);
  const input = createTag('input', {
    id,
    name: param,
    type: 'text',
    inputmode: 'numeric',
    pattern: '[0-9]*',
    required: '',
    autocomplete: 'off',
  });
  const clear = createTag('button', { type: 'button', class: 'banner-cta-clear', hidden: '' });
  const errorIcon = createTag('span', { class: 'banner-cta-error-icon', 'aria-hidden': 'true' });
  const field = createTag('div', { class: 'banner-cta-field' }, [
    createTag('div', { class: 'banner-cta-input' }, [label, input]),
    clear,
    errorIcon,
  ]);
  const submit = createTag('button', {
    type: 'submit',
    class: `button button-sm banner-cta-submit${external ? ' banner-cta-external' : ''}`,
    hidden: '',
  }, cta.textContent.trim());
  const form = createTag('form', { class: 'banner-cta-form', novalidate: '' }, [field, submit]);

  fetchPlaceholders().then((ph) => {
    clear.setAttribute('aria-label', ph.clearInput || 'Clear input');
  });

  const validate = (treatEmptyAsError = false) => {
    const value = input.value.trim();
    const age = /^\d+$/.test(value) ? parseInt(value, 10) : NaN;
    const valid = age >= MIN_AGE && age <= MAX_AGE;
    const error = value ? !valid : treatEmptyAsError;
    field.classList.toggle('has-value', !!value);
    field.classList.toggle('is-error', error);
    input.setAttribute('aria-invalid', String(error));
    clear.hidden = !value;
    submit.hidden = !valid;
    return valid;
  };

  input.addEventListener('input', () => validate());
  clear.addEventListener('click', () => {
    input.value = '';
    validate();
    input.focus();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(true)) {
      input.focus();
      return;
    }
    const url = new URL(cta.href, window.location.href);
    url.searchParams.set(param, String(parseInt(input.value.trim(), 10)));
    if (external) window.open(url.toString(), '_blank', 'noopener');
    else window.location.assign(url.toString());
  });
  return form;
}

/**
 * Banner (CTA): centered panel with optional icon, heading, text and a CTA.
 * Content: row 1 = one cell with icon (optional), h2, paragraph(s), CTA link.
 * Option `age-input`: optional row 2 = field label | query parameter name (default "age");
 * a short paragraph directly above the CTA (after the description) renders as a small note.
 * Option `gradient`: gradient panel background (styling only).
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  const rows = [...block.querySelectorAll(':scope > div')];
  const [contentRow, configRow] = rows;
  if (!contentRow) return;
  const content = createTag('div', { class: 'banner-cta-content' });
  rows.forEach((row) => {
    if (row === configRow && active.includes('age-input')) return;
    [...row.children].forEach((cell) => content.append(...cell.childNodes));
  });

  // a standalone icon/picture paragraph above the heading becomes the panel icon
  const first = content.firstElementChild;
  if (first?.tagName === 'P' && !first.textContent.trim() && first.querySelector('.icon, picture')) {
    first.classList.add('banner-cta-icon');
  }

  const links = [...content.querySelectorAll('a')];
  const cta = links[links.length - 1];
  if (cta) {
    const holder = cta.closest('p');
    const standalone = holder && holder.textContent.trim() === cta.textContent.trim();
    if (active.includes('age-input')) {
      const note = standalone && holder.previousElementSibling;
      if (note?.tagName === 'P' && !note.querySelector('a')
        && note.previousElementSibling?.tagName === 'P') {
        note.classList.add('banner-cta-note');
      }
      const form = buildAgeForm(cta, configRow);
      if (standalone) holder.replaceWith(form);
      else cta.replaceWith(form);
    } else if (cta.classList.contains('button')) {
      cta.classList.add('button-sm');
      if (isExternal(cta.href)) {
        cta.classList.add('banner-cta-external');
        cta.setAttribute('rel', 'noopener');
      }
    }
  }

  block.replaceChildren(content);
}
