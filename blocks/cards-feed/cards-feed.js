import { createTag, fetchPlaceholders } from '../../scripts/shared.js';
import {
  createArticlePicture,
  fetchArticles,
  getArticleBadges,
  readConfigRow,
  selectArticles,
  toPositiveInt,
} from '../../scripts/article-index.js';

let feedId = 0;

/**
 * Split rows into config (source, paths, visible) and promo cards ("insert at N" | content).
 * @param {Element} block
 */
function readFeed(block) {
  const config = { source: '', paths: [], visible: 0 };
  const promos = [];
  [...block.children].forEach((row) => {
    const entry = readConfigRow(row);
    if (!entry) return;
    const insertAt = entry.key.match(/^insert-at-(\d+)$/);
    if (insertAt) promos.push({ position: parseInt(insertAt[1], 10), cell: entry.cell });
    else if (entry.key === 'source') config.source = entry.href || entry.values[0] || '';
    else if (entry.key === 'paths') config.paths = entry.values;
    else if (entry.key === 'visible') config.visible = toPositiveInt(entry.values, 0);
  });
  promos.sort((a, b) => a.position - b.position);
  return { config, promos };
}

function buildArticleCard(article, idx, id, labels) {
  const li = createTag('li', { class: 'cards-feed-card' });
  const picture = createArticlePicture(article.image, article.imageAlt || '', false, [{ width: '750' }]);
  if (picture) li.append(createTag('div', { class: 'cards-feed-image' }, picture));

  const body = createTag('div', { class: 'cards-feed-body' });
  const badges = getArticleBadges(article, labels.ph);
  if (badges.length) {
    body.append(createTag('ul', { class: 'cards-feed-badges' }, badges.map((b) => createTag('li', { class: `is-${b.type}` }, b.label))));
  }
  const headingId = `cards-feed-${id}-title-${idx}`;
  body.append(createTag('h3', { id: headingId }, article.title));
  if (article.readingTime) {
    body.append(createTag('p', { class: 'cards-feed-label' }, article.readingTime));
  }
  const cta = createTag('a', {
    href: article.path,
    class: 'button primary button-sm',
    'aria-describedby': headingId,
  }, labels.readNow);
  body.append(createTag('p', { class: 'button-container cards-feed-cta' }, cta));

  li.append(body);
  return li;
}

/** Authored promo card: icon, heading, text, CTA (cards-action look). */
function buildPromoCard(cell) {
  const li = createTag('li', { class: 'cards-feed-card cards-feed-promo' });
  const body = createTag('div', { class: 'cards-feed-body' });
  body.append(...cell.childNodes);

  // leading paragraph holding only an icon / image becomes the icon
  const first = body.firstElementChild;
  if (first?.tagName === 'P' && first.querySelector('.icon, picture, img') && !first.textContent.trim()) {
    first.className = 'cards-feed-icon';
    li.append(first);
  }

  // italic-only paragraph = read-time label
  body.querySelectorAll(':scope > p').forEach((p) => {
    const em = p.firstElementChild;
    if (p.children.length === 1 && em.tagName === 'EM' && p.textContent.trim() === em.textContent.trim()) {
      p.classList.add('cards-feed-label');
    }
  });

  const cta = [...body.querySelectorAll('a[href]')].pop();
  const ctaContainer = cta?.closest('.button-container') || cta?.parentElement;
  if (ctaContainer && ctaContainer !== body && ctaContainer === body.lastElementChild) {
    ctaContainer.classList.add('cards-feed-cta');
    if (cta.classList.contains('button')) {
      // source promo CTA is the small outlined pill
      cta.classList.remove('primary');
      cta.classList.add('secondary', 'button-sm');
    }
  }

  li.append(body);
  return li;
}

/** Articles in order, promo cards inserted at their 1-based position (or appended). */
function mergeItems(articles, promos) {
  const items = articles.map((article) => ({ article }));
  promos.forEach(({ position, cell }) => {
    items.splice(Math.min(Math.max(position - 1, 0), items.length), 0, { cell });
  });
  return items;
}

/**
 * Cards (feed): paged grid of article tiles built from an article index,
 * with authored promo cards at fixed positions and a "Load more" button.
 * @param {Element} block
 */
export default async function decorate(block) {
  feedId += 1;
  const id = feedId;
  const { config, promos } = readFeed(block);
  const ph = await fetchPlaceholders();
  const labels = {
    readNow: ph.readNow || 'Read now',
    loadMore: ph.loadMore || 'Load more',
    status: ph.cardsShown || 'Showing {shown} of {total}',
    ph,
  };

  let articles = [];
  try {
    articles = selectArticles(await fetchArticles(config.source), config.paths);
  } catch {
    articles = [];
  }

  const items = mergeItems(articles, promos);
  const list = createTag('ul', { class: 'cards-feed-list', role: 'list' });
  const status = createTag('p', { class: 'cards-feed-status', role: 'status', 'aria-live': 'polite' });
  block.replaceChildren(list, status);
  if (!items.length) return;

  let rendered = 0;
  const render = (count) => {
    const batch = items.slice(rendered, rendered + count).map((item, i) => (item.article
      ? buildArticleCard(item.article, rendered + i, id, labels)
      : buildPromoCard(item.cell)));
    list.append(...batch);
    rendered += batch.length;
    return batch;
  };

  const pageSize = config.visible || items.length;
  render(pageSize);
  if (rendered >= items.length) return;

  list.id = `cards-feed-${id}-list`;
  const button = createTag('button', {
    type: 'button',
    class: 'button secondary',
    'aria-controls': list.id,
  }, labels.loadMore);
  const more = createTag('div', { class: 'cards-feed-more' }, button);
  block.insertBefore(more, status);

  button.addEventListener('click', () => {
    const batch = render(pageSize);
    status.textContent = labels.status
      .replace('{shown}', rendered)
      .replace('{total}', items.length);
    // keep focus in the reading order: move it to the first newly shown card
    batch[0]?.querySelector('a[href]')?.focus();
    if (rendered >= items.length) more.remove();
  });
}
