/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: content-page template (/cancer, /find-care/biomarker-testing/, /vaccines/,
 *   /savings-support/self-pay)
 * Selector: #main > div.section.accordion-basic-container .accordion-basic.block
 * Generated: 2026-10-13
 *
 * Output (accordion convention, blocks/accordion-faq/accordion-faq.js):
 *   one row per item: question | answer (paragraphs, lists, small print, CTA links)
 *
 * The section heading (.accordion-basic-content-section h2) sits INSIDE the block
 * element, so it is emitted as default content before the block.
 *
 * Source structure (validated against block-context/accordion-faq/instance-1..4):
 *   .accordion-basic.block
 *     .accordion-basic-content-section h2
 *     .accordion-basic-accordion-stack > details.accordion-basic-card     (iterated)
 *       summary .accordion-basic-card__label (> strong)                    (question)
 *       .accordion-basic-card__expanded-content
 *          .accordion-basic-card__body-container > p | ul                 (answer body)
 *          .accordion-basic-card-button-group a.button                    (CTA, 0..n)
 *          .accordion-basic-card__label-container p                       (small print, self-pay)
 *
 * Also handles the accordion-card-1-1 component (/find-care/cancer-screening/,
 * block-context/accordion-faq/cancer-screening-instance.html):
 *   .accordion-card-1-1.block
 *     .accordion-content-section .accordion-headline-container h2             (section heading)
 *     .accordion-card-stack > details.accordion-card                         (iterated)
 *       summary .accordion-title-label                                       (question)
 *       .accordion-expanded-content .accordion-card-body-container > p       (answer body)
 */
const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const intro = [...element.querySelectorAll('.accordion-basic-content-section h2, .accordion-basic-content-section h3, .accordion-basic-content-section p, .accordion-content-section h2, .accordion-content-section h3, .accordion-content-section p')]
    .filter((el) => clean(el.textContent));

  let items = [...element.querySelectorAll('.accordion-basic-accordion-stack > details, .accordion-card-stack > details')];
  if (!items.length) items = [...element.querySelectorAll('details')];

  const cells = [];
  items.forEach((item) => {
    const labelEl = item.querySelector('summary .accordion-basic-card__label, summary .accordion-title-label') || item.querySelector('summary');
    const question = clean(labelEl ? labelEl.textContent : '');
    if (!question) return;

    const content = item.querySelector('.accordion-basic-card__expanded-content, .accordion-expanded-content') || item;
    const answer = [];
    content.querySelectorAll('.accordion-basic-card__body-container, .accordion-card-body-container').forEach((body) => {
      [...body.children].forEach((el) => {
        if (clean(el.textContent) || el.querySelector('img, picture')) answer.push(el);
      });
    });
    content.querySelectorAll('.accordion-basic-card-button-group a[href]').forEach((a) => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = clean(a.textContent);
      const p = document.createElement('p');
      p.append(link);
      answer.push(p);
    });
    content.querySelectorAll('.accordion-basic-card__label-container p').forEach((p) => {
      if (clean(p.textContent)) answer.push(p);
    });

    const q = document.createElement('p');
    q.textContent = question;
    cells.push([q, answer.length ? answer : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // accordion-card-1-1 (card-style items) -> "Accordion Faq (card)"; accordion-basic -> default
  const isCard = element.classList.contains('accordion-card-1-1')
    || !!element.closest('.accordion-card-1-1')
    || !!element.querySelector(':scope > .accordion-card-1-1');
  const variants = isCard ? ['card'] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', variants, cells });
  if (intro.length) element.before(...intro);
  element.replaceWith(block);
}
