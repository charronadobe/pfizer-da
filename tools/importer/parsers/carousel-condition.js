/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-condition. Base: carousel.
 * Source: https://www.pfizerforall.com/ (.content-cards-carousel.block)
 * Generated: 2026-10-12
 *
 * Output: 2 columns, one row per slide.
 *   Cell 1: photo (desktop crop)
 *   Cell 2: h2 slide headline, h3 card heading, paragraph, CTA link
 *
 * Source structure (validated against source.html):
 *   .slides-container > div.carousel-slide                 (iterated; block-level div)
 *     .image-container > picture.desktop-image | picture.mobile-image
 *     .content-cards-carousel-content-headline-container h2
 *     .content-card .card-headline-container h3
 *     .content-card .card-body-container p
 *     .content-card .card-button-container a.button
 *   Carousel controls (.carousel-indicator-container, live region) are skipped.
 *
 * Only the desktop picture is kept: the block renders every picture in the media
 * cell and has no desktop/mobile switching, so a second picture would stack.
 */
export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll(':scope > .slides-container > .carousel-slide')];
  if (!slides.length) slides = [...element.querySelectorAll('.carousel-slide')];

  const cells = [];
  slides.forEach((slide) => {
    // Media cell
    const imageContainer = slide.querySelector('.image-container, .visual-container') || slide;
    const picture = imageContainer.querySelector('picture.desktop-image')
      || imageContainer.querySelector('picture')
      || imageContainer.querySelector('img:not([src^="data:"])');

    // Content cell
    const contentCell = [];
    const headline = slide.querySelector('.content-cards-carousel-content-headline-container h1, .content-cards-carousel-content-headline-container h2')
      || slide.querySelector('.content-container h2');
    if (headline) contentCell.push(headline);

    const card = slide.querySelector('.content-card') || slide.querySelector('.carousel-content');
    if (card) {
      const cardHeading = card.querySelector('.card-headline-container h3, .card-headline-container h4')
        || card.querySelector('h3, h4');
      if (cardHeading) contentCell.push(cardHeading);
      const body = card.querySelector('.card-body-container');
      if (body) body.querySelectorAll('p').forEach((p) => contentCell.push(p));
      card.querySelectorAll('.card-button-container a[href], .button-container a[href]')
        .forEach((a) => {
          if (contentCell.some((el) => el.contains(a))) return;
          const p = document.createElement('p');
          p.append(a);
          contentCell.push(p);
        });
    }

    if (!picture && !contentCell.length) return;
    cells.push([picture || '', contentCell.length ? contentCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-condition', cells });
  element.replaceWith(block);
}
