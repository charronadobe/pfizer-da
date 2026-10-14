import { createTag } from '../../scripts/shared.js';

let fieldCount = 0;

/**
 * A field item: its own text is the label; a nested list holds the validation message and
 * (optionally) the clear-button label. A label mentioning "mail" makes an email field.
 * @param {Element} li
 */
function buildField(li) {
  const [message = '', clearLabel] = [...li.querySelectorAll(':scope > ul > li')]
    .map((item) => item.textContent.trim());
  const own = li.cloneNode(true);
  own.querySelectorAll(':scope > ul').forEach((ul) => ul.remove());
  const label = own.textContent.replace(/\s+/g, ' ').trim();

  fieldCount += 1;
  const id = `form-signup-field-${fieldCount}`;
  const type = /mail/i.test(label) ? 'email' : 'text';
  const input = createTag('input', {
    id,
    class: 'form-signup-input',
    name: label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
    type,
    autocomplete: type === 'email' ? 'email' : 'on',
    required: '',
  });
  const error = createTag('p', { class: 'form-signup-error', id: `${id}-error`, hidden: '' }, message);
  let clear = null;
  if (clearLabel) {
    clear = createTag('button', {
      type: 'button', class: 'form-signup-clear', 'aria-label': clearLabel, hidden: '',
    });
  }
  const box = createTag('div', { class: 'form-signup-box' }, [
    createTag('label', { class: 'form-signup-label', for: id }, label),
    input,
    createTag('span', { class: 'form-signup-icon', 'aria-hidden': 'true' }),
    clear,
  ]);
  const field = createTag('div', { class: 'form-signup-field' }, [box, error]);

  const sync = () => {
    const hasValue = input.value !== '';
    field.classList.toggle('has-value', hasValue);
    field.classList.toggle('is-filled', hasValue || document.activeElement === input);
    if (clear) clear.hidden = !hasValue;
  };
  clear?.addEventListener('click', () => {
    input.value = '';
    input.focus();
    sync();
  });
  input.addEventListener('focus', sync);
  input.addEventListener('blur', sync);

  const setValid = (valid) => {
    field.classList.toggle('is-error', !valid);
    error.hidden = valid;
    if (valid) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    } else {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', error.id);
    }
  };
  input.addEventListener('input', () => {
    sync();
    if (field.classList.contains('is-error') && input.value.trim() && input.checkValidity()) setValid(true);
  });
  const validate = () => {
    const valid = input.value.trim() !== '' && input.checkValidity();
    setValid(valid);
    return valid;
  };
  return { field, input, validate };
}

/**
 * Form (sign-up): intro panel + sign-up form posting JSON to the authored endpoint.
 * Content:
 * - row 1: cell 1 = icon, h2, paragraph | cell 2 = bulleted list of fields (label, nested list:
 *   error message, clear-button label), submit link (text = button label, href = endpoint),
 *   consent paragraph(s)
 * - optional row 2, one cell: success message (icon, heading, text), shown only on resp.ok
 * @param {Element} block
 */
export default function decorate(block) {
  const [mainRow, successRow] = [...block.children];
  if (!mainRow) return;
  const cells = [...mainRow.children];
  const formCell = cells.find((cell) => cell.querySelector(':scope > ul')) || cells[cells.length - 1];
  const introCell = cells.find((cell) => cell !== formCell);

  const intro = createTag('div', { class: 'form-signup-intro' });
  if (introCell) intro.append(...introCell.childNodes);
  const iconP = intro.firstElementChild;
  if (iconP?.tagName === 'P' && !iconP.textContent.trim() && iconP.querySelector('.icon, picture, img')) {
    iconP.classList.add('form-signup-intro-icon');
  }

  const fields = [...(formCell.querySelector(':scope > ul')?.children || [])].map(buildField);
  // submit link: the bold / standalone (button) link, not an inline consent link
  const submitLink = formCell.querySelector(':scope > p strong a[href], :scope > p.button-container a[href]')
    || formCell.querySelector(':scope > p a[href]');
  const endpoint = submitLink?.href || '';
  const submit = createTag('button', { type: 'submit', class: 'form-signup-submit' }, submitLink?.textContent.trim() || '');
  const form = createTag('form', { class: 'form-signup-form', method: 'post', novalidate: '' }, [
    createTag('div', { class: 'form-signup-fields' }, fields.map((f) => f.field)),
    submit,
  ]);
  if (endpoint) form.setAttribute('action', endpoint);
  [...formCell.querySelectorAll(':scope > p')]
    .filter((p) => !p.contains(submitLink) && p.textContent.trim())
    .forEach((p) => {
      p.className = 'form-signup-disclaimer';
      form.append(p);
    });

  const panel = createTag('div', { class: 'form-signup-panel' }, form);
  let success = null;
  if (successRow) {
    success = createTag('div', {
      class: 'form-signup-success', role: 'status', tabindex: '-1', hidden: '',
    });
    [...successRow.children].forEach((cell) => success.append(...cell.childNodes));
    panel.append(success);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const results = fields.map((f) => f.validate());
    const firstInvalid = fields[results.indexOf(false)];
    if (firstInvalid) {
      firstInvalid.input.focus();
      return;
    }
    if (!endpoint) return;
    submit.disabled = true;
    try {
      const data = Object.fromEntries(fields.map((f) => [f.input.name, f.input.value.trim()]));
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      // only confirm a sign-up the endpoint actually accepted
      if (resp.ok && success) {
        form.hidden = true;
        success.hidden = false;
        success.focus();
      }
    } catch (err) {
      // endpoint unreachable: keep the form so the visitor can retry
    } finally {
      submit.disabled = false;
    }
  });

  block.replaceChildren(intro, panel);
}
