/* eslint-disable */
/* global WebImporter */
/**
 * Parser for search-prompt. Base: search (custom).
 * Source: content-page template (/cancer, /vaccines/, /savings-support/self-pay;
 *   the section is the shared fragment /global/fragment/search-tool-block)
 * Selector: #main > div.section.search-block-text-2-1-container .search-block-text-2-1-search
 * Generated: 2026-10-13
 *
 * Output (blocks/search-prompt/search-prompt.js): 1 row, 1 cell:
 *   placeholder paragraph + link (text = button label, href = search results page)
 *
 * The heading/intro (.search-block-text-2-1-type-stack) is outside the matched element and
 * stays default content.
 *
 * Source structure (validated against block-context/search-prompt/instance-1.html):
 *   .search-block-text-2-1-search
 *     .search-block-text-2-1-input label.input-label   ('Try "Migraine Treatment"')
 *                                  input.input-field     (no form/action: JS navigation)
 *     .search-block-text-2-1-button button .button__label ("Search")
 * The source button navigates with JS to the site's results page (/search-result?q=...),
 * so the link targets /search-result; the block appends ?q=<term>.
 */
const RESULTS_PATH = '/search-result';
const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const labelEl = element.querySelector('.search-block-text-2-1-input label, label.input-label');
  const input = element.querySelector('input.input-field, input[type="text"], input[type="search"]');
  const placeholder = clean(labelEl ? labelEl.textContent : '') || clean(input && input.getAttribute('placeholder'));
  const button = element.querySelector('.search-block-text-2-1-button button, button[type="submit"]');
  const buttonLabel = clean(button ? (button.querySelector('.button__label') || button).textContent : '');

  if (!placeholder && !buttonLabel) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const content = [];
  if (placeholder) {
    const p = document.createElement('p');
    p.textContent = placeholder;
    content.push(p);
  }
  const form = element.closest('form') || element.querySelector('form');
  const action = form && form.getAttribute('action');
  const a = document.createElement('a');
  a.href = action || RESULTS_PATH;
  a.textContent = buttonLabel || placeholder;
  const p = document.createElement('p');
  p.append(a);
  content.push(p);

  const cells = [[content]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'search-prompt', cells });
  element.replaceWith(block);
}
