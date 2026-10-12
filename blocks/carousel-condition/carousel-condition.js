import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag, fetchPlaceholders } from '../../scripts/shared.js';

let carouselId = 0;

function getSlides(block) {
  return [...block.querySelectorAll('.carousel-condition-slide')];
}

function setActive(block, index) {
  block.dataset.activeSlide = index;
  getSlides(block).forEach((slide, idx) => {
    const active = idx === index;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', !active);
    slide.querySelectorAll('a, button').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });
  block.querySelectorAll('.carousel-condition-indicator button').forEach((btn, idx) => {
    if (idx === index) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  });

  // prev is hidden on the first slide and next on the last: keep keyboard focus on a visible arrow
  const prev = block.querySelector('.carousel-condition-prev');
  const next = block.querySelector('.carousel-condition-next');
  const last = getSlides(block).length - 1;
  if (index === 0 && document.activeElement === prev) next?.focus();
  if (index === last && document.activeElement === next) prev?.focus();
}

function showSlide(block, index) {
  const slides = getSlides(block);
  if (!slides.length) return;
  const target = (index + slides.length) % slides.length;
  block.querySelector('.carousel-condition-slides').scrollTo({
    top: 0,
    left: slides[target].offsetLeft,
    behavior: 'smooth',
  });
  setActive(block, target);
}

/**
 * Split the authored content cell into the large slide headline (first heading)
 * and the overlay card (everything that follows it).
 */
function buildContent(cells) {
  const nodes = cells.flatMap((cell) => [...cell.children]);
  const content = createTag('div', { class: 'carousel-condition-slide-content' });
  const headlineIdx = nodes.findIndex((el) => /^H[1-6]$/.test(el.tagName));
  const hasCardHeading = nodes.some((el, i) => i > headlineIdx && /^H[1-6]$/.test(el.tagName));

  // only treat the first heading as the slide headline when a card heading follows it
  if (headlineIdx !== -1 && hasCardHeading) {
    const headline = createTag('div', { class: 'carousel-condition-headline' });
    headline.append(...nodes.slice(0, headlineIdx + 1));
    content.append(headline);
    nodes.splice(0, headlineIdx + 1);
  }

  if (nodes.length) {
    const card = createTag('div', { class: 'carousel-condition-card' });
    card.append(...nodes);
    // source card CTA is the small pill button
    card.querySelectorAll('a.button').forEach((a) => a.classList.add('button-sm'));
    content.append(card);
  }
  return content;
}

function createSlide(row, idx, id, total, labels) {
  const slide = createTag('li', {
    class: 'carousel-condition-slide',
    id: `carousel-condition-${id}-slide-${idx}`,
    'aria-roledescription': labels.slide,
    'aria-label': `${idx + 1} ${labels.of} ${total}`,
  });
  slide.dataset.slideIndex = idx;

  const cells = [...row.children];
  const mediaCell = cells.find((cell) => cell.querySelector('picture') && !cell.textContent.trim());

  if (mediaCell) {
    mediaCell.className = 'carousel-condition-slide-media';
    mediaCell.querySelectorAll('picture > img').forEach((img) => {
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]));
    });
    slide.append(mediaCell);
  }

  slide.append(buildContent(cells.filter((cell) => cell !== mediaCell)));
  return slide;
}

function buildControls(block, total, labels) {
  const nav = createTag('div', { class: 'carousel-condition-controls', role: 'group', 'aria-label': labels.controls });
  const prev = createTag('button', { type: 'button', class: 'carousel-condition-prev', 'aria-label': labels.previous });
  const next = createTag('button', { type: 'button', class: 'carousel-condition-next', 'aria-label': labels.next });
  const indicators = createTag('ol', { class: 'carousel-condition-indicators' });

  for (let i = 0; i < total; i += 1) {
    const btn = createTag('button', {
      type: 'button',
      'aria-label': `${labels.showSlide} ${i + 1} ${labels.of} ${total}`,
    });
    btn.addEventListener('click', () => showSlide(block, i));
    indicators.append(createTag('li', { class: 'carousel-condition-indicator' }, btn));
  }

  prev.addEventListener('click', () => showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1));
  next.addEventListener('click', () => showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1));

  nav.append(prev, indicators, next);
  return nav;
}

export default async function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  const rows = [...block.children];
  const ph = await fetchPlaceholders();
  const labels = {
    region: ph.carouselRegion || 'Carousel',
    slide: ph.slide || 'Slide',
    of: ph.of || 'of',
    controls: ph.carouselSlideControls || 'Carousel Slide Controls',
    previous: ph.previousSlide || 'Previous Slide',
    next: ph.nextSlide || 'Next Slide',
    showSlide: ph.showSlide || 'Show Slide',
  };

  block.id = `carousel-condition-${id}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', labels.region);

  const slidesList = createTag('ul', { class: 'carousel-condition-slides' });
  rows.forEach((row, idx) => {
    slidesList.append(createSlide(row, idx, id, rows.length, labels));
    row.remove();
  });

  const container = createTag('div', { class: 'carousel-condition-slides-container' }, slidesList);
  block.replaceChildren(container);
  setActive(block, 0);

  if (rows.length < 2) return;

  container.append(buildControls(block, rows.length, labels));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(block, parseInt(entry.target.dataset.slideIndex, 10));
    });
  }, { root: slidesList, threshold: 0.6 });
  getSlides(block).forEach((slide) => observer.observe(slide));
}
