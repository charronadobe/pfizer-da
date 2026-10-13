import { createTag } from '../../scripts/shared.js';

const HEADING = /^H[1-6]$/;

/** A paragraph whose whole text is bold. */
function isBoldParagraph(el) {
  const strong = el.querySelector('strong, b');
  return el.tagName === 'P' && strong && el.textContent.trim() === strong.textContent.trim();
}

/** A paragraph holding nothing but one link (possibly bold/italic). */
function isLinkParagraph(el) {
  const links = el.tagName === 'P' ? el.querySelectorAll('a') : [];
  return links.length === 1 && el.textContent.trim() === links[0].textContent.trim();
}

/**
 * Cards (fact): key-fact cards - small topic question, large statement, explanatory text.
 * Content: one row per card, one cell (cells are merged): topic heading (h3), statement
 * (a second heading, or a fully bold paragraph), paragraph(s), optional link paragraph last
 * (rendered as a text link at the bottom of the card). Exactly 3 cards lay out 3-across on desktop.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = createTag('ul', { class: 'cards-fact-list' });

  [...block.children].forEach((row) => {
    const items = [...row.children].flatMap((cell) => [...cell.children]);
    if (!items.length) return;
    const li = createTag('li', { class: 'cards-fact-card' });

    const headings = items.filter((el) => HEADING.test(el.tagName));
    let topic = null;
    let statement = null;
    if (headings.length >= 2) {
      [topic, statement] = headings;
    } else {
      const bold = items.find(isBoldParagraph);
      if (headings[0] && bold) {
        [topic] = headings;
        statement = bold;
      } else {
        statement = headings[0] || bold || null;
      }
    }

    if (topic) li.append(createTag('div', { class: 'cards-fact-topic' }, topic));
    if (statement) li.append(createTag('div', { class: 'cards-fact-statement' }, statement));
    const rest = items.filter((el) => el !== topic && el !== statement);
    const last = rest[rest.length - 1];
    if (last && isLinkParagraph(last)) {
      // a text link, not the default button decoration
      last.classList.remove('button-container');
      last.classList.add('cards-fact-link');
      const a = last.querySelector('a');
      a.classList.remove('button', 'primary', 'secondary');
      if (!a.classList.length) a.removeAttribute('class');
    }
    if (rest.length) li.append(createTag('div', { class: 'cards-fact-body' }, rest));
    ul.append(li);
  });

  if (ul.children.length === 3) ul.classList.add('cards-fact-list-3');
  block.replaceChildren(ul);
}
