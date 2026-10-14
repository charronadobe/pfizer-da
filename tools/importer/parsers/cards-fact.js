/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-fact. Base: cards (1 column, "no images" convention).
 * Source: https://www.pfizerforall.com/find-care/biomarker-testing/
 * Selector: #main > div.section.vertical-card-container .vertical-card.block
 * Generated: 2026-10-13
 *
 * Output (blocks/cards-fact/cards-fact.js): one row per card, one cell:
 *   topic h3, statement h3 (second heading), body paragraph(s),
 *   optional last paragraph holding only the card link (a.button.text, span dropped)
 *
 * The topic is a <p> on savings-support/prescription-assistance and an <h3> on
 * biomarker-testing; both are emitted as h3.
 *
 * The section intro (.vertical-card-content-section h2 + body) sits INSIDE the block
 * element, so it is emitted as default content before the block.
 *
 * Source structure (validated against block-context/cards-fact/instance-1..2):
 *   .vertical-card.block
 *     .vertical-card-content-section h2, p
 *     .vertical-card-stacked > .vertical-card-item                  (iterated; block-level div)
 *        .vertical-card-topic h3
 *        .vertical-card-heading h3 > strong                         (statement)
 *        .vertical-card-body .vertical-card-body-text p
 */
const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

function heading3(el, document) {
  const h3 = document.createElement('h3');
  h3.textContent = clean(el.textContent);
  return h3;
}

export default function parse(element, { document }) {
  const intro = [...element.querySelectorAll('.vertical-card-content-section h2, .vertical-card-content-section h3, .vertical-card-content-section p')]
    .filter((el) => clean(el.textContent));

  let items = [...element.querySelectorAll('.vertical-card-stacked > .vertical-card-item')];
  if (!items.length) items = [...element.querySelectorAll('.vertical-card-item')];

  const cells = [];
  items.forEach((item) => {
    const cell = [];
    const topic = item.querySelector('.vertical-card-topic h1, .vertical-card-topic h2, .vertical-card-topic h3, .vertical-card-topic h4, .vertical-card-topic p');
    if (topic && clean(topic.textContent)) cell.push(heading3(topic, document));
    const statement = item.querySelector('.vertical-card-heading h1, .vertical-card-heading h2, .vertical-card-heading h3, .vertical-card-heading h4, .vertical-card-heading p');
    if (statement && clean(statement.textContent)) cell.push(heading3(statement, document));
    // Body copy; button-group paragraphs are handled as the link row below.
    const cta = item.querySelector('.vertical-card-button-group a.button[href], a.button.text[href]');
    item.querySelectorAll('.vertical-card-body p, .vertical-card-body ul, .vertical-card-body ol').forEach((el) => {
      if (el.closest('.vertical-card-button-group') || (cta && el.contains(cta))) return;
      if (clean(el.textContent)) cell.push(el);
    });
    // Optional last paragraph with only the link (text kept, inner span dropped).
    if (cta && clean(cta.textContent)) {
      const link = document.createElement('a');
      link.href = cta.getAttribute('href');
      const title = cta.getAttribute('title');
      if (title) link.title = title;
      link.textContent = clean(cta.textContent);
      const p = document.createElement('p');
      p.append(link);
      cell.push(p);
    }
    if (cell.length) cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-fact', cells });
  if (intro.length) element.before(...intro);
  element.replaceWith(block);
}
