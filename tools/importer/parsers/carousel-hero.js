/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://www.pfizerforall.com/ (.hero.has-carousel .hero-image-and-info-container)
 * Generated: 2026-10-12
 *
 * Output: 2 columns, one row per slide.
 *   Cell 1: desktop picture (+ mobile picture) OR link to the background .mp4 video
 *   Cell 2: heading (h1 on first slide, h2 otherwise), paragraph, CTA link
 *
 * Source structure (validated against source.html):
 *   .hero-carousel-backgrounds > .hero-carousel-background-item   (one per slide, same order)
 *     - video slides: video.video-element-player > source[src$=".mp4"]
 *     - image slides: .hero-carousel-background-desktop/-mobile picture
 *   .hero-overlay-carousel-scroller > .hero-overlay-slide           (one per slide)
 *     - optional .hero-overlay-slide-background-desktop/-mobile picture
 *     - .hero-overlay-headline-container h1|h2
 *     - .hero-overlay-body-container p
 *     - .hero-overlay-button-group a
 * Iteration is keyed on the block-level div.hero-overlay-slide (not on anchors).
 */
export default function parse(element, { document }) {
  const slides = [...element.querySelectorAll('.hero-overlay-slide')];
  const backgrounds = [...element.querySelectorAll('.hero-carousel-backgrounds > .hero-carousel-background-item, .hero-carousel-background-item')]
    .filter((el, idx, arr) => arr.indexOf(el) === idx);

  const videoLink = (src) => {
    const a = document.createElement('a');
    a.href = src;
    a.textContent = src;
    return a;
  };

  const getPictures = (scope, desktopSel, mobileSel) => {
    if (!scope) return [];
    const out = [];
    const desktop = scope.querySelector(desktopSel);
    const mobile = scope.querySelector(mobileSel);
    if (desktop || mobile) {
      [desktop, mobile].forEach((wrap) => {
        const pic = wrap && (wrap.querySelector('picture') || wrap.querySelector('img'));
        if (pic) out.push(pic);
      });
    } else {
      scope.querySelectorAll('picture').forEach((pic) => out.push(pic));
      if (!out.length) scope.querySelectorAll('img:not([src^="data:"])').forEach((img) => out.push(img));
    }
    return out;
  };

  const getVideoSrc = (scope) => {
    if (!scope) return null;
    const source = scope.querySelector('video source[src], source[src$=".mp4"]');
    if (source) return source.getAttribute('src');
    const video = scope.querySelector('video[src]');
    return video ? video.getAttribute('src') : null;
  };

  const cells = [];

  slides.forEach((slide, idx) => {
    const bg = backgrounds[idx] || null;

    // Media cell
    const mediaCell = [];
    const videoSrc = slide.classList.contains('has-background-video') || !slide.querySelector('.hero-overlay-slide-background')
      ? getVideoSrc(bg)
      : null;
    if (videoSrc) {
      mediaCell.push(videoLink(videoSrc));
    } else {
      let pics = getPictures(
        slide.querySelector('.hero-overlay-slide-background'),
        '.hero-overlay-slide-background-desktop',
        '.hero-overlay-slide-background-mobile',
      );
      if (!pics.length) {
        pics = getPictures(bg, '.hero-carousel-background-desktop', '.hero-carousel-background-mobile');
      }
      mediaCell.push(...pics);
      if (!pics.length) {
        const fallbackVideo = getVideoSrc(bg);
        if (fallbackVideo) mediaCell.push(videoLink(fallbackVideo));
      }
    }

    // Content cell
    const contentCell = [];
    const heading = slide.querySelector('.hero-overlay-headline-container h1, .hero-overlay-headline-container h2, .hero-overlay-headline-container h3')
      || slide.querySelector('h1, h2, h3');
    if (heading) contentCell.push(heading);
    const body = slide.querySelector('.hero-overlay-body-container');
    if (body) {
      const paras = [...body.querySelectorAll('p')];
      if (paras.length) contentCell.push(...paras);
      else if (body.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = body.textContent.trim();
        contentCell.push(p);
      }
    }
    const ctas = [...slide.querySelectorAll('.hero-overlay-button-group a[href]')];
    ctas.forEach((a) => {
      const p = document.createElement('p');
      p.append(a);
      contentCell.push(p);
    });

    if (!mediaCell.length && !contentCell.length) return;
    cells.push([mediaCell.length ? mediaCell : '', contentCell.length ? contentCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
