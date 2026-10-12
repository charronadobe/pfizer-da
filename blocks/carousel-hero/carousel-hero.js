import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag, fetchPlaceholders } from '../../scripts/shared.js';

const AUTOPLAY_INTERVAL = 7000;
const VIDEO_PATTERN = /\.(mp4|webm|ogg)(\?.*)?$/i;
const VIDEO_TYPES = { mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg' };

let carouselId = 0;

function getSlides(block) {
  return [...block.querySelectorAll('.carousel-hero-slide')];
}

function setActive(block, index) {
  const slides = getSlides(block);
  block.dataset.activeSlide = index;
  slides.forEach((slide, idx) => {
    const active = idx === index;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', !active);
    slide.querySelectorAll('a, button').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
    const video = slide.querySelector('video');
    if (video) {
      if (active && block.dataset.paused !== 'true') video.play().catch(() => {});
      else video.pause();
    }
  });
  block.querySelectorAll('.carousel-hero-indicator button').forEach((btn, idx) => {
    if (idx === index) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  });
}

function showSlide(block, index) {
  const slides = getSlides(block);
  if (!slides.length) return;
  const target = (index + slides.length) % slides.length;
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: slides[target].offsetLeft,
    behavior: 'smooth',
  });
  setActive(block, target);
}

/**
 * Degrade a slide whose background video cannot load: drop the video and
 * fall back to its poster image (if any) or to a media-less slide, so no
 * empty/broken background layer is left behind.
 */
function handleVideoError(cell, video) {
  // source and video can both report the failure; only handle it once
  if (!cell.contains(video)) return;
  const fallback = cell.dataset.fallbackPicture === 'true'
    ? [...cell.querySelectorAll('template')].map((t) => t.content.cloneNode(true))
    : [];
  video.remove();
  cell.querySelectorAll('template').forEach((t) => t.remove());
  if (fallback.length) {
    cell.append(...fallback);
  } else {
    cell.closest('.carousel-hero-slide')?.classList.add('carousel-hero-slide-no-media');
    cell.remove();
  }
}

function buildVideo(link, cell) {
  const video = createTag('video', {
    muted: '',
    loop: '',
    playsinline: '',
    preload: 'metadata',
    'aria-hidden': 'true',
  });
  video.muted = true;
  const source = createTag('source', { src: link.href, type: VIDEO_TYPES[link.href.match(VIDEO_PATTERN)[1].toLowerCase()] });
  // with <source> children, load failures fire "error" on the source, not the video
  const onError = () => handleVideoError(cell, video);
  source.addEventListener('error', onError, { once: true });
  video.addEventListener('error', onError, { once: true });
  video.append(source);
  return video;
}

function decorateMedia(cell, eager) {
  cell.classList.add('carousel-hero-slide-media');
  const videoLink = [...cell.querySelectorAll('a[href]')].find((a) => VIDEO_PATTERN.test(a.href));
  const pictures = [...cell.querySelectorAll('picture')];

  pictures.forEach((picture, idx) => {
    const img = picture.querySelector('img');
    if (!img) return;
    const optimized = createOptimizedPicture(img.src, img.alt || '', eager && idx === 0, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]);
    if (pictures.length > 1) {
      optimized.classList.add(idx === 0 ? 'carousel-hero-media-desktop' : 'carousel-hero-media-mobile');
    }
    picture.replaceWith(optimized);
  });

  if (videoLink) {
    const video = buildVideo(videoLink, cell);
    const kept = [...cell.querySelectorAll('picture')];
    const poster = kept[0]?.querySelector('img');
    if (poster) video.setAttribute('poster', poster.currentSrc || poster.src);
    // keep authored pictures (inert) so they can replace the video if it fails
    const templates = kept.map((picture) => {
      const template = document.createElement('template');
      template.content.append(picture);
      return template;
    });
    if (templates.length) cell.dataset.fallbackPicture = 'true';
    cell.replaceChildren(video, ...templates);
  } else {
    const kept = [...cell.querySelectorAll('picture')];
    cell.replaceChildren(...kept);
  }
}

function createSlide(row, idx, id, total, labels) {
  const slide = createTag('li', {
    class: 'carousel-hero-slide',
    id: `carousel-hero-${id}-slide-${idx}`,
    'aria-roledescription': labels.slide,
    'aria-label': `${idx + 1} ${labels.of} ${total}`,
  });
  slide.dataset.slideIndex = idx;

  const cells = [...row.children];
  const mediaCell = cells.find((c) => c.querySelector('picture, a[href$=".mp4"], video'))
    || (cells.length > 1 ? cells[0] : null);
  const contentCells = cells.filter((c) => c !== mediaCell);

  const content = createTag('div', { class: 'carousel-hero-slide-content' });
  contentCells.forEach((cell) => content.append(...cell.childNodes));

  if (mediaCell) {
    // only the first slide's image is LCP-critical; the rest load lazily
    decorateMedia(mediaCell, idx === 0);
    if (mediaCell.children.length) slide.append(mediaCell);
    else slide.classList.add('carousel-hero-slide-no-media');
  } else {
    slide.classList.add('carousel-hero-slide-no-media');
  }

  slide.append(content);
  return slide;
}

function startAutoplay(block) {
  clearInterval(block.autoplayTimer);
  if (block.dataset.paused === 'true') return;
  block.autoplayTimer = setInterval(() => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  }, AUTOPLAY_INTERVAL);
}

function setPaused(block, paused, toggle, labels) {
  block.dataset.paused = paused;
  toggle.setAttribute('aria-label', paused ? labels.play : labels.pause);
  toggle.setAttribute('aria-pressed', paused);
  const activeVideo = block.querySelector('.carousel-hero-slide.is-active video');
  if (activeVideo) {
    if (paused) activeVideo.pause();
    else activeVideo.play().catch(() => {});
  }
  if (paused) clearInterval(block.autoplayTimer);
  else startAutoplay(block);
}

function buildControls(block, total, labels) {
  const nav = createTag('div', { class: 'carousel-hero-controls', role: 'group', 'aria-label': labels.controls });
  const prev = createTag('button', { type: 'button', class: 'carousel-hero-prev', 'aria-label': labels.previous });
  const next = createTag('button', { type: 'button', class: 'carousel-hero-next', 'aria-label': labels.next });
  const toggle = createTag('button', { type: 'button', class: 'carousel-hero-toggle' });
  const indicators = createTag('ol', { class: 'carousel-hero-indicators' });

  for (let i = 0; i < total; i += 1) {
    const btn = createTag('button', {
      type: 'button',
      'aria-label': `${labels.showSlide} ${i + 1} ${labels.of} ${total}`,
    });
    btn.addEventListener('click', () => {
      showSlide(block, i);
      startAutoplay(block);
    });
    indicators.append(createTag('li', { class: 'carousel-hero-indicator' }, btn));
  }

  prev.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    startAutoplay(block);
  });
  next.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    startAutoplay(block);
  });
  toggle.addEventListener('click', () => {
    setPaused(block, block.dataset.paused !== 'true', toggle, labels);
  });

  nav.append(prev, indicators, next, toggle);
  return { nav, toggle };
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
    pause: ph.pauseCarousel || 'Pause',
    play: ph.playCarousel || 'Play',
  };

  block.id = `carousel-hero-${id}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', labels.region);

  const slidesList = createTag('ul', { class: 'carousel-hero-slides', 'aria-live': 'off' });
  rows.forEach((row, idx) => {
    slidesList.append(createSlide(row, idx, id, rows.length, labels));
    row.remove();
  });

  const container = createTag('div', { class: 'carousel-hero-slides-container' }, slidesList);
  block.replaceChildren(container);

  if (rows.length < 2) {
    setActive(block, 0);
    return;
  }

  const { nav, toggle } = buildControls(block, rows.length, labels);
  container.append(nav);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  block.dataset.paused = 'false';
  setActive(block, 0);
  setPaused(block, reducedMotion, toggle, labels);

  // keep active state in sync when users swipe/scroll the slide track
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(block, parseInt(entry.target.dataset.slideIndex, 10));
    });
  }, { root: slidesList, threshold: 0.6 });
  getSlides(block).forEach((slide) => observer.observe(slide));

  // pause rotation while users interact with the slide content
  block.addEventListener('focusin', () => clearInterval(block.autoplayTimer));
  block.addEventListener('focusout', () => startAutoplay(block));
}
