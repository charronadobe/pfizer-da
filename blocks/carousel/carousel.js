import { createOptimizedPicture } from '../../scripts/aem.js';
import { applyDesignTokenStyle } from '../../scripts/design-tokens.js';

function normalizeIndex(index, length) {
  return (index + length) % length;
}

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx === slideIndex) {
      button.setAttribute('disabled', 'true');
    } else {
      button.removeAttribute('disabled');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  const realSlideIndex = normalizeIndex(slideIndex, slides.length);
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));

  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });

  updateActiveSlide(activeSlide);
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev')?.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });

  block.querySelector('.slide-next')?.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) updateActiveSlide(entry.target);
      });
    },
    { threshold: 0.5 },
  );

  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

let isFirstCarousel = true;

function wrapCarouselCTAGroup(column) {
  const buttonContainers = Array.from(column.querySelectorAll('.button-container'));
  if (buttonContainers.length < 2) return;

  const groupsByParent = new Map();
  buttonContainers.forEach((buttonContainer) => {
    const parent = buttonContainer.parentElement;
    if (!parent) return;

    const siblings = groupsByParent.get(parent) || [];
    siblings.push(buttonContainer);
    groupsByParent.set(parent, siblings);
  });

  const wrapGroup = (group) => {
    if (group.length < 2) return;

    const wrapper = document.createElement('div');
    wrapper.classList.add('carousel-cta-group');
    group[0].before(wrapper);
    group.forEach((buttonContainer) => wrapper.append(buttonContainer));
  };

  groupsByParent.forEach((siblings) => {
    let currentGroup = [];

    siblings.forEach((buttonContainer) => {
      const previous = currentGroup[currentGroup.length - 1];

      if (!previous) {
        currentGroup = [buttonContainer];
        return;
      }

      if (previous.nextElementSibling === buttonContainer) {
        currentGroup.push(buttonContainer);
        return;
      }

      wrapGroup(currentGroup);
      currentGroup = [buttonContainer];
    });

    wrapGroup(currentGroup);
  });
}

function isSlideContentEmpty(column) {
  if (column.querySelector('img, picture, iframe, video')) return false;
  return !column.textContent.trim();
}

function createSlide(row, slideIndex, carouselId, isFirstSlide = false) {
  const columns = [...row.querySelectorAll(':scope > div')];
  const styleCol = columns.length >= 3 ? columns[2] : null;
  const styleName = styleCol?.textContent?.trim() || '';
  styleCol?.remove();

  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  if (styleName) applyDesignTokenStyle(slide, styleName);

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);

    // Remove any images with about:error src before processing
    const errorImages = column.querySelectorAll('img[src="about:error"]');
    errorImages.forEach((img) => img.remove());

    // Replace images with optimized pictures (4000px), preserving eager behavior for first image
    const shouldEager = isFirstCarousel && isFirstSlide && colIdx === 0;
    const images = column.querySelectorAll('img');
    images.forEach((img) => {
      const altText = (img.alt && img.alt.trim() !== '') ? img.alt : `Carousel slide ${slideIndex + 1} image`;
      const optimized = createOptimizedPicture(img.src, altText, shouldEager, [{ width: '4000' }]);
      // Ensure high fetch priority for the first carousel's first slide main image
      const optimizedImg = optimized.querySelector('img');
      if (shouldEager && optimizedImg) {
        optimizedImg.setAttribute('fetchpriority', 'high');
      }
      const replaceTarget = img.closest('picture') || img;
      replaceTarget.replaceWith(optimized);
    });

    if (column.classList.contains('carousel-slide-content')) {
      wrapCarouselCTAGroup(column);
      if (isSlideContentEmpty(column)) {
        column.hidden = true;
      }
    }

    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;

export default async function decorate(block) {
  block.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    heading.classList.add('slide-title');
  });
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);

  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');

    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId, idx === 0);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }

    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  showSlide(block, 0);

  if (!isSingleSlide) {
    const schedule = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 200));
    schedule(() => bindEvents(block));
  }

  // Set the global flag to false after first carousel is initialized
  if (isFirstCarousel) isFirstCarousel = false;
}
