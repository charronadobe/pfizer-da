import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag, fetchPlaceholders } from '../../scripts/shared.js';

function isIconCell(cell) {
  return cell.querySelector('picture, img, .icon') && !cell.textContent.trim();
}

function buildCard(row) {
  const li = createTag('li', { class: 'cards-carousel-card' });
  const cells = [...row.children];
  const iconCell = cells.find(isIconCell);
  const body = createTag('div', { class: 'cards-carousel-body' });

  if (iconCell) {
    iconCell.className = 'cards-carousel-icon';
    iconCell.querySelectorAll('img').forEach((img) => {
      const media = img.closest('picture') || img;
      if (/\.svg(\?|$)/i.test(img.src)) {
        // SVG icons render as a mask so they pick up the tile's icon colour (currentColor)
        const glyph = createTag('span', { class: 'cards-carousel-glyph' });
        if (img.alt) {
          glyph.setAttribute('role', 'img');
          glyph.setAttribute('aria-label', img.alt);
        } else {
          glyph.setAttribute('aria-hidden', 'true');
        }
        glyph.style.setProperty('--cards-carousel-glyph', `url("${img.src}")`);
        media.replaceWith(glyph);
        return;
      }
      media.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '200' }]));
    });
    li.append(iconCell);
  }

  cells.filter((cell) => cell !== iconCell).forEach((cell) => body.append(...cell.childNodes));

  // pin the trailing CTA to the bottom of the tile
  const cta = [...body.querySelectorAll('a[href]')].pop();
  const ctaContainer = cta?.closest('.button-container') || cta?.parentElement;
  if (ctaContainer && ctaContainer !== body && ctaContainer === body.lastElementChild) {
    ctaContainer.classList.add('cards-carousel-cta');
    if (cta.classList.contains('button')) cta.classList.add('secondary', 'button-sm');
  }

  li.append(body);
  return li;
}

/** distance between two neighbouring tiles (tile width + track gap) */
function cardStep(track) {
  const card = track.querySelector('.cards-carousel-card');
  if (!card) return 0;
  return card.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
}

function scrollByCard(track, direction) {
  track.scrollBy({ left: direction * cardStep(track), behavior: 'smooth' });
}

function updateControls(block) {
  const track = block.querySelector('.cards-carousel-track');
  const prev = block.querySelector('.cards-carousel-prev');
  const next = block.querySelector('.cards-carousel-next');
  const indicators = block.querySelector('.cards-carousel-indicators');
  if (!prev || !next || !indicators) return;
  const max = track.scrollWidth - track.clientWidth;
  const atStart = track.scrollLeft <= 1;
  const atEnd = track.scrollLeft >= max - 1;
  prev.disabled = atStart;
  next.disabled = atEnd;
  // nothing to scroll (all tiles fit): hide the controls entirely
  block.classList.toggle('cards-carousel-static', max <= 1);

  // one bar per scroll position (tiles - fully visible tiles + 1)
  const step = cardStep(track);
  const total = track.children.length;
  const style = getComputedStyle(track);
  const viewport = track.clientWidth
    - parseFloat(style.paddingInlineStart) - parseFloat(style.paddingInlineEnd);
  const visible = step ? Math.max(1, Math.floor((viewport + step * 0.1) / step)) : 1;
  const positions = Math.max(1, total - visible + 1);
  while (indicators.children.length < positions) indicators.append(createTag('li'));
  while (indicators.children.length > positions) indicators.lastElementChild.remove();
  // many positions: idle bars shrink to dots so the row keeps its width
  indicators.classList.toggle('is-compact', positions > 5);

  const current = step ? Math.round(track.scrollLeft / step) : 0;
  const active = atEnd ? positions - 1 : Math.min(current, positions - 1);
  [...indicators.children].forEach((dot, idx) => {
    dot.classList.toggle('is-active', idx === active);
  });
}

/**
 * Cards (carousel): a horizontally scrolling row of icon tiles
 * (icon | heading, text, CTA) with previous / next controls.
 * @param {Element} block
 */
export default async function decorate(block) {
  const track = createTag('ul', { class: 'cards-carousel-track' });
  [...block.children].forEach((row) => track.append(buildCard(row)));
  block.replaceChildren(track);

  // let the track bleed to the viewport edges (CSS reads these offsets)
  const updateBleed = () => {
    const { left, right } = block.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    block.style.setProperty('--cards-carousel-bleed-start', `${Math.max(0, Math.round(left))}px`);
    block.style.setProperty('--cards-carousel-bleed-end', `${Math.max(0, Math.round(viewport - right))}px`);
  };
  updateBleed();
  new ResizeObserver(updateBleed).observe(block);
  window.addEventListener('resize', updateBleed, { passive: true });

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

  const prev = createTag('button', { type: 'button', class: 'cards-carousel-prev', 'aria-label': labels.previous });
  const next = createTag('button', { type: 'button', class: 'cards-carousel-next', 'aria-label': labels.next });
  // bars are (re)built by updateControls to match the number of scroll positions
  const indicators = createTag('ol', { class: 'cards-carousel-indicators', 'aria-hidden': 'true' });

  prev.addEventListener('click', () => scrollByCard(track, -1));
  next.addEventListener('click', () => scrollByCard(track, 1));

  const controls = createTag('div', { class: 'cards-carousel-controls', role: 'group', 'aria-label': labels.controls });
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
