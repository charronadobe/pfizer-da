/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form-signup. Base: form (custom).
 * Source: https://www.pfizerforall.com/vaccines/
 * Selector: #main > div.section.form-container .form.block
 * Generated: 2026-10-13
 *
 * Output (blocks/form-signup/form-signup.js, same field-list convention as the footer sign-up):
 *   Row 1, 2 cells:
 *     intro: icon paragraph, h2, paragraph
 *     form:  <ul> one item per field: label text + nested <ul>(validation message, clear-button label)
 *            <p><strong><a href="{endpoint}">{submit label}</a></strong></p>
 *            consent paragraph(s)
 *   Row 2 (1 cell, optional): success message (icon, h3, paragraph)
 *
 * Source structure (validated against block-context/form-signup/instance-1.html):
 *   .form.signup-2-1.block
 *     .form-left-content .form-headline-container p > span.icon.icon-email, h2
 *                        .form-body-section p
 *     .form-right-form form.form-form-container (method=post, no action)
 *        .form-text-field label.input-label + input[name] + button.input-clear-button[aria-label]
 *        .form-honeypot-field (skipped)
 *        .form-button-container button[type=submit] .button__label
 *        .form-content-footer-section p (consent + "Learn more" link)
 *
 * Not in the rendered DOM, read from their real sources (nothing hard-coded):
 *  - validation messages: the site's form JS loads the form definition from the Pfizer
 *    forms service (GET .../api/v2/forms with header x-config-token = the authored
 *    `form-token`), whose `required` validator messages are what the page shows on an
 *    empty submit (verified live). The token comes from the page's EDS .plain.html.
 *  - success message: authored `success-text` row in the .plain.html.
 *  - endpoint: the source <form> has no action (it posts to the third-party service with a
 *    CSRF token), so the submit link uses the authored-path convention of the footer
 *    sign-up: /global/forms/signup-{first path segment}-form (e.g. signup-vaccines-form).
 */
const ORIGIN = 'https://www.pfizerforall.com';
const FORMS_SERVICE = {
  production: 'https://ms-forms-service-production.digitalpfizer.com/api/v2/forms',
  uat: 'https://ms-forms-service-uat.digitalpfizer.com/api/v2/forms',
};

let plainCache;
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

/** Authored config of this form block, matched by its headline text. */
function authoredConfig(element, headingText, params) {
  const plain = loadPlain(params);
  if (!plain) return null;
  const configs = [...plain.querySelectorAll('div.form')].map(readConfig);
  const h = clean(headingText).toLowerCase();
  return configs.find((c) => c.headline && clean(c.headline.textContent).toLowerCase().includes(h))
    || configs[Math.max(0, [...element.ownerDocument.querySelectorAll('.form.block')].indexOf(element))]
    || null;
}

/** Field definitions (name -> required message) from the forms service. */
function serviceMessages(cfg) {
  const out = {};
  if (!cfg || !cfg['form-token']) return out;
  const tokens = clean(cfg['form-token'].textContent).split(' ').filter(Boolean);
  const prod = tokens.find((t) => /production/.test(t));
  const attempts = [];
  if (prod) attempts.push([FORMS_SERVICE.production, prod]);
  tokens.filter((t) => t !== prod).forEach((t) => attempts.push([FORMS_SERVICE.uat, t]));
  for (const [endpoint, token] of attempts) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', endpoint, false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('x-config-token', token);
      xhr.send();
      if (xhr.status !== 200) continue;
      const json = JSON.parse(xhr.responseText);
      ((json.data && json.data.fields) || []).forEach((f) => {
        const validators = f.validators || [];
        const v = validators.find((x) => x.type === 'required') || validators[0];
        if (f.name && v && v.message) out[f.name] = v.message;
      });
      if (Object.keys(out).length) return out;
    } catch (e) { /* try next */ }
  }
  return out;
}

function iconImage(name, document) {
  const img = document.createElement('img');
  img.src = `${ORIGIN}/assets/icons/${name}.svg?format=svg`;
  img.alt = '';
  return img;
}

function iconFrom(container, document) {
  const span = container && container.querySelector('span.icon');
  const name = span && [...span.classList].find((c) => c.startsWith('icon-'));
  // site icon loader strips an `asset-` prefix: icon-asset-pill-bottle -> pill-bottle.svg
  return name ? iconImage(name.replace(/^icon-/, '').replace(/^asset-/, ''), document) : null;
}

export default function parse(element, { document, params }) {
  const left = element.querySelector('.form-left-content') || element;
  const formEl = element.querySelector('form');
  const heading = left.querySelector('.form-headline-container h2, .form-headline-container h3') || element.querySelector('h2, h3');

  if (!heading && !formEl) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cfg = authoredConfig(element, heading ? heading.textContent : '', params);

  // Intro cell
  const intro = [];
  // The live intro starts with <p><span class="icon icon-email"><svg>...</svg></span></p>, but
  // helix-importer's preProcess (DOMUtils.reviewParagraphs, before transform) deletes that
  // text-less paragraph, so the icon is usually gone here. Fall back to the authored
  // `headline` row of the page's .plain.html (<p><span class="icon icon-email"></span></p>).
  const icon = iconFrom(left.querySelector('.form-headline-container'), document)
    || (cfg && cfg.headline ? iconFrom(cfg.headline, document) : null);
  if (icon) {
    const p = document.createElement('p');
    p.append(icon);
    intro.push(p);
  }
  if (heading) intro.push(heading);
  left.querySelectorAll('.form-body-section p').forEach((p) => {
    if (clean(p.textContent)) intro.push(p);
  });

  // Form cell
  const messages = serviceMessages(cfg);
  const formCell = [];
  const list = document.createElement('ul');
  (formEl ? [...formEl.querySelectorAll('.form-text-field')] : []).forEach((field) => {
    const input = field.querySelector('input');
    const label = clean((field.querySelector('label') || {}).textContent || (input && input.getAttribute('placeholder')));
    if (!label) return;
    const li = document.createElement('li');
    li.append(document.createTextNode(label));
    const message = (input && messages[input.name])
      || clean((field.querySelector('.input-supporting-text') || {}).textContent);
    const clear = field.querySelector('.input-clear-button');
    const clearLabel = clear ? clean(clear.getAttribute('aria-label')) : '';
    if (message) {
      const sub = document.createElement('ul');
      [message, clearLabel].filter(Boolean).forEach((t) => {
        const item = document.createElement('li');
        item.textContent = t;
        sub.append(item);
      });
      li.append(sub);
    }
    list.append(li);
  });
  if (list.children.length) formCell.push(list);

  const submitBtn = formEl && formEl.querySelector('button[type=submit]');
  const submitLabel = submitBtn ? clean((submitBtn.querySelector('.button__label') || submitBtn).textContent) : '';
  if (submitLabel) {
    let endpoint = formEl.getAttribute('action') || '';
    if (!endpoint) {
      let slug = 'page';
      try {
        const u = new URL((params && params.originalURL) || window.location.href);
        slug = u.pathname.split('/').filter(Boolean)[0] || 'home';
      } catch (e) { /* default slug */ }
      endpoint = `/global/forms/signup-${slug}-form`;
    }
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = endpoint;
    a.textContent = submitLabel;
    strong.append(a);
    p.append(strong);
    formCell.push(p);
  }
  element.querySelectorAll('.form-content-footer-section p').forEach((p) => {
    if (clean(p.textContent)) formCell.push(p);
  });

  const cells = [[intro.length ? intro : '', formCell.length ? formCell : '']];

  // Success message (authored success-text)
  if (cfg && cfg['success-text']) {
    const success = [];
    [...cfg['success-text'].children].forEach((el) => {
      const ic = el.querySelector('span.icon');
      if (ic && !clean(el.textContent)) {
        const node = iconFrom(el, document);
        if (node) {
          const p = document.createElement('p');
          p.append(node);
          success.push(p);
        }
        return;
      }
      let node = document.importNode(el, true);
      if (/^H[1-6]$/.test(node.tagName)) {
        const h3 = document.createElement('h3');
        h3.innerHTML = node.innerHTML;
        node = h3;
      }
      node.removeAttribute('id');
      success.push(node);
    });
    if (success.length) cells.push([success]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'form-signup', cells });
  element.replaceWith(block);
}
