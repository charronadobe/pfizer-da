import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag, fetchPlaceholders } from '../../scripts/shared.js';

function isImageCell(cell) {
  return cell.querySelector('picture, img') && !cell.textContent.trim();
}

/**
 * Content before the heading is the tag list: a bulleted list, or a paragraph of
 * comma-separated tags. A bold tag (e.g. **Recommended**) is highlighted.
 * @param {Element} body
 */
function decorateTags(body) {
  const heading = body.querySelector(':scope > :is(h1, h2, h3, h4, h5, h6)');
  if (!heading) return;
  const before = [];
  let el = heading.previousElementSibling;
  while (el) {
    before.unshift(el);
    el = el.previousElementSibling;
  }
  const tags = [];
  before.forEach((node) => {
    if (node.matches('ul, ol')) {
      [...node.children].forEach((li) => tags.push({ text: li.textContent.trim(), highlight: !!li.querySelector('strong, b') }));
    } else if (node.tagName === 'P' && !node.querySelector('picture, a')) {
      const strong = [...node.querySelectorAll('strong, b')].map((s) => s.textContent.trim());
      node.textContent.split(',').forEach((t) => tags.push({ text: t.trim(), highlight: strong.includes(t.trim()) }));
    }
  });
  const items = tags.filter((t) => t.text);
  if (!items.length) return;
  before.forEach((node) => node.remove());
  heading.before(createTag('ul', { class: 'cards-article-tags' }, items.map((t) => createTag('li', t.highlight ? { class: 'is-highlight' } : {}, t.text))));
}

function buildCard(row) {
  const li = createTag('li', { class: 'cards-article-card' });
  const cells = [...row.children];
  const imageCell = cells.find(isImageCell);
  const body = createTag('div', { class: 'cards-article-body' });

  if (imageCell) {
    const img = imageCell.querySelector('img');
    // SVG = small icon above the text (e.g. promo card); raster = full-width photo
    const isIcon = img && /\.svg$/i.test(new URL(img.src, window.location.href).pathname);
    if (isIcon) {
      imageCell.className = 'cards-article-icon';
      li.classList.add('cards-article-card-icon');
    } else {
      imageCell.className = 'cards-article-image';
      // only same-origin images can be optimized; external ones keep their authored picture
      imageCell.querySelectorAll('picture > img').forEach((pic) => {
        if (new URL(pic.src, window.location.href).origin !== window.location.origin) {
          pic.loading = 'lazy';
          return;
        }
        pic.closest('picture').replaceWith(createOptimizedPicture(pic.src, pic.alt || '', false, [{ width: '750' }]));
      });
    }
    li.append(imageCell);
  }

  cells.filter((cell) => cell !== imageCell).forEach((cell) => body.append(...cell.childNodes));
  decorateTags(body);

  // italic-only paragraph = read-time label
  body.querySelectorAll(':scope > p').forEach((p) => {
    const em = p.firstElementChild;
    if (p.children.length === 1 && em.tagName === 'EM' && p.textContent.trim() === em.textContent.trim()) {
      p.classList.add('cards-article-label');
    }
  });

  // pin the trailing CTA to the bottom of the card
  const cta = [...body.querySelectorAll('a[href]')].pop();
  const ctaContainer = cta?.closest('.button-container') || cta?.parentElement;
  if (ctaContainer && ctaContainer !== body && ctaContainer === body.lastElementChild) {
    ctaContainer.classList.add('cards-article-cta');
    if (cta.classList.contains('button')) cta.classList.add('button-sm');
  }

  li.append(body);
  return li;
}

function scrollByCard(track, direction) {
  const card = track.querySelector('.cards-article-card');
  if (!card) return;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  track.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' });
}

/**
 * One indicator per scroll position: cards - (cards fully in view) + 1.
 * @param {Element} track
 */
function getPagination(track) {
  const card = track.querySelector('.cards-article-card');
  const total = track.children.length;
  if (!card) return { pages: 1, step: 1 };
  const style = getComputedStyle(track);
  const gap = parseFloat(style.columnGap) || 0;
  const inner = track.clientWidth - (parseFloat(style.paddingLeft) || 0)
    - (parseFloat(style.paddingRight) || 0);
  const step = card.offsetWidth + gap;
  const visible = Math.max(1, Math.floor((inner + gap) / step + 0.01));
  return { pages: Math.max(1, total - visible + 1), step };
}

function updateControls(block) {
  const track = block.querySelector('.cards-article-track');
  const prev = block.querySelector('.cards-article-prev');
  const next = block.querySelector('.cards-article-next');
  const indicators = block.querySelector('.cards-article-indicators');
  if (!prev || !next || !indicators) return;
  const max = track.scrollWidth - track.clientWidth;
  const atStart = track.scrollLeft <= 1;
  const atEnd = track.scrollLeft >= max - 1;
  prev.disabled = atStart;
  next.disabled = atEnd;
  block.classList.toggle('cards-article-static', max <= 1);

  const { pages, step } = getPagination(track);
  if (indicators.children.length !== pages) {
    indicators.replaceChildren(...Array.from({ length: pages }, () => createTag('li')));
  }
  const active = atEnd ? pages - 1 : Math.min(Math.round(track.scrollLeft / step), pages - 1);
  [...indicators.children].forEach((dot, idx) => {
    dot.classList.toggle('is-active', idx === active);
  });
}

/**
 * Cards (article): horizontally scrolling article cards
 * (optional photo | tags, heading, text, read time, CTA) with previous / next controls.
 * @param {Element} block
 */
export default async function decorate(block) {
  const track = createTag('ul', { class: 'cards-article-track' });
  [...block.children].forEach((row) => track.append(buildCard(row)));
  block.replaceChildren(track);

  const total = track.children.length;
  if (total < 2) return;

  const ph = await fetchPlaceholders();
  const labels = {
    region: ph.carouselRegion || 'Carousel',
    controls: ph.carouselSlideControls || 'Carousel Slide Controls',
    previous: ph.previousSlide || 'Previous Slide',
    next: ph.nextSlide || 'Next Slide',
  };

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', labels.region);

  const prev = createTag('button', { type: 'button', class: 'cards-article-prev', 'aria-label': labels.previous });
  const next = createTag('button', { type: 'button', class: 'cards-article-next', 'aria-label': labels.next });
  const indicators = createTag('ol', { class: 'cards-article-indicators', 'aria-hidden': 'true' });

  prev.addEventListener('click', () => scrollByCard(track, -1));
  next.addEventListener('click', () => scrollByCard(track, 1));

  const controls = createTag('div', { class: 'cards-article-controls', role: 'group', 'aria-label': labels.controls });
  controls.append(prev, indicators, next);
  block.append(controls);

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateControls(block);
      ticking = false;
    });
  }, { passive: true });
  new ResizeObserver(() => updateControls(block)).observe(track);
  updateControls(block);
}
