/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards.
 * Source: content-page template (/find-care/biomarker-testing/, /find-care/prepare-for-care, /vaccines/)
 * Selector: #main > div.section.cards-carousel-container .cards-carousel.block.dynamic-article
 * Generated: 2026-10-13
 *
 * Output (cards convention, blocks/cards-article/cards-article.js): one row per card,
 *   [optional image | tags paragraph, h3, body paragraph(s), italic read-time paragraph, CTA]
 *   - tags: comma-separated paragraph, the "Recommended" badge (badge--recommended) in <strong>
 *     so the block highlights it
 *   - no image -> empty first cell (rows keep 2 cells)
 *
 * The section intro (.cards-carousel-content-section: eyebrow, h2, body) sits INSIDE the
 * block element, so it is emitted as default content before the block.
 *
 * Source structure (validated against block-context/cards-article/instance-1..3):
 *   ul.cards-list > li.card                                 (iterated; block-level li)
 *     .card-image picture img                               (photo; biomarker, prepare-for-care)
 *     .card-icon span.icon.icon-{name}                      (vaccines: icon-hidden-icon = no image;
 *                                                            any other icon -> /assets/icons/{name}.svg)
 *     .card-content .card-badge-container span.badge .badge__label   (tags)
 *     .card-content .card-eyebrow-container p               (hidden by the block's no-eyebrow class; skipped)
 *     .card-content .card-headline-container h3
 *     .card-content .card-body-container p
 *     .card-content .card-label-container p                 (read time)
 *     .card-content p.button-container a
 */
const ORIGIN = 'https://www.pfizerforall.com';

function absUrl(src) {
  try { return new URL(src, ORIGIN).href; } catch (e) { return src; }
}

function buildImage(card, document) {
  const img = card.querySelector('.card-image img');
  if (img) {
    const src = img.getAttribute('src') || '';
    if (src && !src.startsWith('data:')) {
      const out = document.createElement('img');
      out.src = absUrl(src);
      out.alt = img.getAttribute('alt') || '';
      return out;
    }
  }
  const span = card.querySelector('.card-icon span.icon');
  const name = span && [...span.classList].find((c) => c.startsWith('icon-'));
  if (!name || name === 'icon-hidden-icon') return null;
  const out = document.createElement('img');
  out.src = `${ORIGIN}/assets/icons/${name.replace(/^icon-/, '')}.svg?format=svg`;
  out.alt = '';
  return out;
}

const clean = (t) => t.replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const intro = [];
  const introRoot = element.querySelector('.cards-carousel-content-section');
  if (introRoot) {
    introRoot.querySelectorAll('.cards-carousel-content-eyebrow-container p, .cards-carousel-content-headline-container h2, .cards-carousel-content-headline-container h3, .cards-carousel-content-body-container p')
      .forEach((el) => intro.push(el));
  }

  let cards = [...element.querySelectorAll('ul.cards-list > li.card')];
  if (!cards.length) cards = [...element.querySelectorAll('.card')].filter((c) => !c.closest('.cards-carousel-content-section'));

  const cells = [];
  cards.forEach((card) => {
    const image = buildImage(card, document);
    const content = card.querySelector('.card-content') || card;
    const text = [];

    // Tags (badges) -> one comma-separated paragraph; Recommended badge in bold
    const badges = [...content.querySelectorAll('.card-badge-container .badge')]
      .filter((b) => clean(b.textContent));
    if (badges.length) {
      const p = document.createElement('p');
      badges.forEach((b, i) => {
        if (i) p.append(document.createTextNode(', '));
        const label = clean(b.textContent);
        if (b.classList.contains('badge--recommended')) {
          const strong = document.createElement('strong');
          strong.textContent = label;
          p.append(strong);
        } else {
          p.append(document.createTextNode(label));
        }
      });
      text.push(p);
    }

    const heading = content.querySelector('.card-headline-container h2, .card-headline-container h3, .card-headline-container h4')
      || content.querySelector('h2, h3, h4');
    if (heading) text.push(heading);
    content.querySelectorAll('.card-body-container p').forEach((p) => text.push(p));

    content.querySelectorAll('.card-label-container p').forEach((p) => {
      const label = clean(p.textContent);
      if (!label) return;
      const out = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = label;
      out.append(em);
      text.push(out);
    });

    content.querySelectorAll('.button-container a[href]').forEach((a) => {
      const p = document.createElement('p');
      p.append(a);
      text.push(p);
    });

    if (!image && !text.length) return;
    cells.push([image || '', text.length ? text : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  if (intro.length) element.before(...intro);
  element.replaceWith(block);
}
