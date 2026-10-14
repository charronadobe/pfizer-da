import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { createTag, fetchPlaceholders, getLocale } from '../../scripts/shared.js';

/**
 * Read page metadata regardless of the key's casing in the delivered <meta name>
 * (e.g. `breadcrumb` vs `Breadcrumb`, `breadcrumb-title` vs `Breadcrumb-Title`).
 * @param {string} name lower-case metadata name
 * @returns {string}
 */
function pageMeta(name) {
  return getMetadata(name)
    || getMetadata(name.replace(/(^|-)([a-z])/g, (m, sep, c) => sep + c.toUpperCase()));
}

/**
 * Turn a URL slug into a readable label ("biomarker-testing" → "Biomarker testing").
 * @param {string} slug
 * @returns {string}
 */
function labelFromSlug(slug) {
  const text = decodeURIComponent(slug).replace(/[-_]+/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Build the breadcrumb ("Home / current page"), so authors never write it.
 * The current page label comes from the `breadcrumb-title` page metadata when set,
 * otherwise from the last path segment. Returns null on the home page.
 * @returns {Element|null}
 */
function buildBreadcrumb() {
  const { prefix } = getLocale();
  const path = window.location.pathname.slice(prefix.length).replace(/\.html$/, '');
  const segment = path.split('/').filter(Boolean).pop();
  if (!segment) return null;

  const nav = createTag('nav', { class: 'hero-page-breadcrumb' });
  const list = createTag('ol');
  const home = createTag('a', { href: `${prefix}/` });
  const label = pageMeta('breadcrumb-title') || labelFromSlug(segment);
  list.append(
    createTag('li', {}, home),
    createTag('li', {}, createTag('span', { 'aria-current': 'page' }, label)),
  );
  nav.append(list);

  // localized labels load without blocking the LCP
  fetchPlaceholders().then((ph) => {
    home.textContent = ph.breadcrumbHome || ph.home || 'Home';
    nav.setAttribute('aria-label', ph.breadcrumb || 'Breadcrumb');
  });
  return nav;
}

const OPTION_CLASSES = ['dropdown', 'announcement'];
const BREADCRUMB_OFF = ['off', 'no', 'false', 'none', 'hide', 'hidden'];
let selectorCount = 0;

/**
 * Whether the page opts out of the auto breadcrumb via the `breadcrumb` page metadata
 * (e.g. `Breadcrumb | off`).
 * @returns {boolean}
 */
function breadcrumbDisabled() {
  return BREADCRUMB_OFF.includes(pageMeta('breadcrumb').trim().toLowerCase());
}

/**
 * Extract the announcement (option `announcement`): the first paragraph holding only a link
 * (optionally bold/italic) that comes before the heading. Returns a strip with that link,
 * stripped of the default button styling, or null when no such paragraph is authored.
 * @param {Element} block
 * @returns {Element|null}
 */
function extractAnnouncement(block) {
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const para = [...block.querySelectorAll('p')].find((p) => {
    const links = p.querySelectorAll('a');
    if (links.length !== 1 || p.textContent.trim() !== links[0].textContent.trim()) return false;
    if (p.querySelector('picture, img')) return false;
    // must precede the heading (document order) when a heading exists
    return !heading || !!(p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  if (!para) return null;
  const link = para.querySelector('a');
  link.classList.remove('button', 'primary', 'secondary');
  if (!link.classList.length) link.removeAttribute('class');
  const strip = createTag('div', { class: 'hero-page-announcement' }, createTag('p', {}, link));
  para.remove();
  return strip;
}

/**
 * Build the care-type selector (dropdown option) from an authored bulleted list of links.
 * A list item without a link is used as the button text ("Select a condition"). Renders a
 * disclosure button + list of links (navigation, not a form control).
 * @param {Element} list the authored <ul>/<ol>
 * @param {Element[]} labelNodes elements shown as the visible label above the button
 * @returns {Element}
 */
function buildSelector(list, labelNodes) {
  selectorCount += 1;
  const id = `hero-page-selector-${selectorCount}`;
  const items = [...list.querySelectorAll(':scope > li')];
  const promptItem = items.find((li) => !li.querySelector('a'));
  const links = items.map((li) => li.querySelector('a')).filter(Boolean);

  const wrapper = createTag('div', { class: 'hero-page-selector' });
  let labelId;
  if (labelNodes.length) {
    labelId = `${id}-label`;
    const label = createTag('div', { class: 'hero-page-selector-label', id: labelId });
    label.append(...labelNodes);
    wrapper.append(label);
  }

  const buttonText = createTag('span', { class: 'hero-page-selector-text' }, promptItem?.textContent.trim() || '');
  const button = createTag('button', {
    type: 'button',
    class: 'hero-page-selector-button',
    'aria-expanded': 'false',
    'aria-controls': `${id}-menu`,
  }, [buttonText, createTag('span', { class: 'hero-page-selector-chevron', 'aria-hidden': 'true' })]);
  if (labelId) button.setAttribute('aria-describedby', labelId);

  const menu = createTag('ul', { class: 'hero-page-selector-menu', id: `${id}-menu`, hidden: '' });
  links.forEach((a) => menu.append(createTag('li', {}, a)));

  // no authored prompt item: fall back to the label text, then a localized placeholder
  if (!buttonText.textContent) {
    buttonText.textContent = labelNodes.map((n) => n.textContent.trim()).join(' ');
    if (!buttonText.textContent) {
      fetchPlaceholders().then((ph) => { buttonText.textContent = ph.selectAnOption || 'Select'; });
    }
  }

  const close = (focusButton = false) => {
    button.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    if (focusButton) button.focus();
  };
  const open = () => {
    button.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
  };

  button.addEventListener('click', () => {
    if (button.getAttribute('aria-expanded') === 'true') close();
    else open();
  });
  button.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      open();
      menu.querySelector('a')?.focus();
    } else if (e.key === 'Escape') {
      close();
    }
  });
  menu.addEventListener('keydown', (e) => {
    const anchors = [...menu.querySelectorAll('a')];
    const idx = anchors.indexOf(document.activeElement);
    if (e.key === 'Escape') {
      close(true);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = e.key === 'ArrowDown' ? idx + 1 : idx - 1;
      anchors[(next + anchors.length) % anchors.length]?.focus();
    }
  });
  wrapper.addEventListener('focusout', (e) => {
    if (!wrapper.contains(e.relatedTarget)) close();
  });
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) close();
  });

  wrapper.append(createTag('div', { class: 'hero-page-selector-control' }, [button, menu]));
  return wrapper;
}

/**
 * Extract the selector (dropdown option): the last list in the block. When the list sits in
 * its own row/cell, the other content of that cell (e.g. "Choose a condition…") is the label.
 * @param {Element} block
 * @returns {Element|null}
 */
function extractSelector(block) {
  const lists = block.querySelectorAll('ul, ol');
  const list = lists[lists.length - 1];
  if (!list) return null;
  const cell = list.closest('.hero-page > div > div');
  const ownCell = cell && !cell.querySelector('h1, h2, h3, h4, h5, h6, picture');
  const labelNodes = ownCell
    ? [...cell.children].filter((el) => el !== list && el.textContent.trim())
    : [];
  list.remove();
  if (ownCell) {
    const row = cell.parentElement;
    cell.remove();
    if (!row.children.length) row.remove();
  }
  return buildSelector(list, labelNodes);
}

/**
 * Hero (page): full-bleed banner image above a breadcrumb, h1 and intro text.
 * Content: one row; the image and text may share one cell or sit in separate cells/rows.
 * Option `dropdown`: the last bulleted list of links becomes a selector (see extractSelector).
 * Option `announcement`: a link-only paragraph before the heading becomes a strip under the
 * banner image (see extractAnnouncement).
 * Page metadata `breadcrumb: off` suppresses the auto breadcrumb.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  const selector = active.includes('dropdown') ? extractSelector(block) : null;
  const announcement = active.includes('announcement') ? extractAnnouncement(block) : null;

  const media = createTag('div', { class: 'hero-page-media' });
  const content = createTag('div', { class: 'hero-page-content' });

  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const optimized = createOptimizedPicture(img.src, img.alt || '', true, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]);
    optimized.querySelector('img').setAttribute('fetchpriority', 'high');
    media.append(optimized);
    const holder = picture.parentElement;
    picture.remove();
    // drop the paragraph that only wrapped the image
    if (holder?.tagName === 'P' && !holder.textContent.trim() && !holder.children.length) holder.remove();
  }

  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    content.append(...cell.childNodes);
  });

  if (selector) content.append(selector);

  const breadcrumb = breadcrumbDisabled() ? null : buildBreadcrumb();
  const body = createTag('div', { class: 'hero-page-body' }, content);
  if (breadcrumb) body.prepend(breadcrumb);

  block.replaceChildren(
    ...(media.children.length ? [media] : []),
    ...(announcement ? [announcement] : []),
    body,
  );
  if (!media.children.length) block.classList.add('hero-page-no-image');
}
