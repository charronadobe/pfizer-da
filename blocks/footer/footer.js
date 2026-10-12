/*
 * Footer block – brand logo, link list, legal copy and a sign-up card.
 * All copy, links and images come from the footer fragment (footer.plain.html):
 *   section 1: logo link          section 2: link list        section 3: legal paragraphs
 *   section 4: sign-up (heading, field list with error text, submit link = endpoint, disclaimer)
 *   section 5: success message (icon, heading, text)
 */

let fieldId = 0;

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.filter(Boolean));
  return node;
}

/** Fetch the footer fragment: /content first (local preview), then the site root (DA/EDS). */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
  // fragment image paths are relative to the fragment, not the current page
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return [...doc.body.children].filter((c) => c.tagName === 'DIV');
}

/** a field item: label text + nested list holding the validation message */
function buildField(li) {
  const message = li.querySelector('ul > li')?.textContent.trim() || '';
  const label = [...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent.trim()).join(' ').trim();
  fieldId += 1;
  const id = `footer-field-${fieldId}`;
  const input = el('input', 'footer-field-input');
  input.id = id;
  input.name = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  input.type = /mail/i.test(label) ? 'email' : 'text';
  input.autocomplete = input.type === 'email' ? 'email' : 'on';
  input.required = true;
  const labelEl = el('label', 'footer-field-label', label);
  labelEl.htmlFor = id;
  const error = el('p', 'footer-field-error', message);
  error.id = `${id}-error`;
  error.hidden = true;
  const box = el('div', 'footer-field-box', labelEl, input, el('span', 'footer-field-icon'));
  const field = el('div', `footer-field${input.type === 'email' ? ' footer-field-wide' : ''}`, box, error);

  const sync = () => field.classList.toggle('is-filled', input.value !== '' || document.activeElement === input);
  input.addEventListener('focus', sync);
  input.addEventListener('blur', sync);
  input.addEventListener('input', () => {
    sync();
    if (field.classList.contains('is-error') && input.value.trim() && input.checkValidity()) {
      field.classList.remove('is-error');
      input.removeAttribute('aria-invalid');
      error.hidden = true;
    }
  });
  const validate = () => {
    const valid = input.value.trim() !== '' && input.checkValidity();
    field.classList.toggle('is-error', !valid);
    error.hidden = valid;
    if (valid) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    } else {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', error.id);
    }
    return valid;
  };
  return { field, input, validate };
}

/** sign-up card: heading, fields, submit (link href = endpoint), disclaimer, success panel */
function buildSignup(section, successSection) {
  const card = el('div', 'footer-signup');
  const heading = section.querySelector('h2, h3');
  if (heading) {
    heading.className = 'footer-signup-title';
    card.append(heading);
  }
  const form = el('form', 'footer-signup-form');
  form.noValidate = true;
  const fields = [...(section.querySelector(':scope > ul')?.children || [])].map(buildField);
  form.append(el('div', 'footer-signup-fields', ...fields.map((f) => f.field)));

  const submitLink = section.querySelector('p strong a, p a');
  const submit = el('button', 'footer-signup-submit', submitLink?.textContent.trim() || '');
  submit.type = 'submit';
  form.action = submitLink?.href || '';
  form.method = 'post';
  form.append(submit);
  const disclaimer = [...section.querySelectorAll(':scope > p')].find((p) => !p.contains(submitLink));
  if (disclaimer) {
    disclaimer.className = 'footer-signup-disclaimer';
    form.append(disclaimer);
  }
  card.append(form);

  let success = null;
  if (successSection) {
    success = el('div', 'footer-signup-success', ...successSection.children);
    success.hidden = true;
    success.setAttribute('role', 'status');
    success.tabIndex = -1;
    card.append(success);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const results = fields.map((f) => f.validate());
    const firstInvalid = fields[results.indexOf(false)];
    if (firstInvalid) {
      firstInvalid.input.focus();
      return;
    }
    if (!form.action) return;
    submit.disabled = true;
    try {
      const data = Object.fromEntries(fields.map((f) => [f.input.name, f.input.value.trim()]));
      const resp = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      // only confirm a subscription the endpoint actually accepted
      if (resp.ok && success) {
        form.hidden = true;
        heading?.setAttribute('hidden', '');
        success.hidden = false;
        success.focus();
      }
    } catch (err) {
      // endpoint unreachable: keep the form so the visitor can retry
    } finally {
      submit.disabled = false;
    }
  });
  return card;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const sections = await fetchFooter();
  block.textContent = '';
  if (!sections) return;
  const [brand, links, legal, signup, success] = sections;
  const inner = el('div', 'footer-inner');

  const logoLink = brand?.querySelector('a');
  if (logoLink) {
    logoLink.className = 'footer-logo';
    const img = logoLink.querySelector('img');
    if (img) {
      img.className = 'footer-logo-img';
      img.loading = 'lazy';
    }
    inner.append(logoLink);
  }

  const list = links?.querySelector('ul');
  if (list) {
    list.className = 'footer-links';
    // external destinations open in a new tab and carry an external-link icon (as on the source)
    list.querySelectorAll('a[href]').forEach((a) => {
      if (new URL(a.href, window.location.href).host === window.location.host) return;
      a.classList.add('is-external');
      a.target = '_blank';
      a.rel = 'noopener';
    });
    const navLabel = logoLink?.querySelector('img')?.alt;
    const nav = el('nav', 'footer-nav', list);
    if (navLabel) nav.setAttribute('aria-label', navLabel);
    inner.append(nav);
  }

  if (signup) inner.append(buildSignup(signup, success));

  if (legal) {
    const legalEl = el('div', 'footer-legal', ...legal.children);
    inner.append(legalEl);
  }
  block.append(inner);
}
