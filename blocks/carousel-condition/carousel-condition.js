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

  // the articles option loops, so both arrows always stay visible
  if (block.classList.contains('articles')) return;

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

/**
 * `articles` option: read the optional config rows (source, limit, paths).
 * @param {Element[]} rows
 */
function readArticlesConfig(rows, { readConfigRow, toPositiveInt }) {
  const config = { source: '', limit: 3, paths: [] };
  rows.forEach((row) => {
    const entry = readConfigRow(row);
    if (!entry) return;
    if (entry.key === 'source') config.source = entry.href || entry.values[0] || '';
    if (entry.key === 'limit') config.limit = toPositiveInt(entry.values, config.limit);
    if (entry.key === 'paths') config.paths = entry.values;
  });
  return config;
}

/** `articles` option: one slide per article (photo + overlay card). */
function createArticleSlide(article, idx, id, total, labels, { createArticlePicture, getArticleBadges }) {
  const slide = createTag('li', {
    class: 'carousel-condition-slide',
    id: `carousel-condition-${id}-slide-${idx}`,
    'aria-roledescription': labels.slide,
    'aria-label': `${idx + 1} ${labels.of} ${total}`,
  });
  slide.dataset.slideIndex = idx;

  const picture = createArticlePicture(article.image, article.imageAlt || '', idx === 0, [
    { media: '(min-width: 900px)', width: '2000' },
    { width: '900' },
  ]);
  if (picture) slide.append(createTag('div', { class: 'carousel-condition-slide-media' }, picture));

  const card = createTag('div', { class: 'carousel-condition-card' });
  const badges = getArticleBadges(article, labels.ph);
  if (badges.length) {
    card.append(createTag('ul', { class: 'carousel-condition-badges' }, badges.map((b) => createTag('li', { class: `is-${b.type}` }, b.label))));
  }
  const headingId = `carousel-condition-${id}-title-${idx}`;
  card.append(createTag('h3', { id: headingId }, article.title));
  if (article.readingTime) {
    card.append(createTag('p', { class: 'carousel-condition-label' }, article.readingTime));
  }
  const cta = createTag('a', {
    href: article.path,
    class: 'button primary button-sm',
    'aria-describedby': headingId,
  }, labels.readNow);
  card.append(createTag('p', { class: 'button-container' }, cta));

  slide.append(createTag('div', { class: 'carousel-condition-slide-content' }, card));
  return slide;
}

async function buildArticleSlides(rows, id, labels) {
  // loaded on demand so authored (homepage) carousels do not pay for it
  const index = await import('../../scripts/article-index.js');
  const config = readArticlesConfig(rows, index);
  let articles = [];
  try {
    const all = await index.fetchArticles(config.source);
    articles = index.selectArticles(all, config.paths).slice(0, config.limit);
  } catch {
    articles = [];
  }
  return articles.map((article, idx) => createArticleSlide(
    article,
    idx,
    id,
    articles.length,
    labels,
    index,
  ));
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
    readNow: ph.readNow || 'Read now',
    ph,
  };

  block.id = `carousel-condition-${id}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', labels.region);

  const slidesList = createTag('ul', { class: 'carousel-condition-slides' });
  const isArticles = block.classList.contains('articles');
  if (isArticles) {
    slidesList.append(...await buildArticleSlides(rows, id, labels));
    rows.forEach((row) => row.remove());
  } else {
    rows.forEach((row, idx) => {
      slidesList.append(createSlide(row, idx, id, rows.length, labels));
      row.remove();
    });
  }
  const total = slidesList.children.length;

  const container = createTag('div', { class: 'carousel-condition-slides-container' }, slidesList);
  block.replaceChildren(container);
  // no articles (empty / failed data source): hide the empty slideshow
  if (isArticles && !total) {
    block.closest('.carousel-condition-wrapper')?.setAttribute('hidden', '');
    return;
  }
  setActive(block, 0);

  if (total < 2) return;

  container.append(buildControls(block, total, labels));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(block, parseInt(entry.target.dataset.slideIndex, 10));
    });
  }, { root: slidesList, threshold: 0.6 });
  getSlides(block).forEach((slide) => observer.observe(slide));
}
