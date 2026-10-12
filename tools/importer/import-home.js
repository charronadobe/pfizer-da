/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import columnsIntroParser from './parsers/columns-intro.js';
import cardsActionParser from './parsers/cards-action.js';
import carouselConditionParser from './parsers/carousel-condition.js';
import columnsMediaParser from './parsers/columns-media.js';
import columnsBannerParser from './parsers/columns-banner.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/pfizerforall-cleanup.js';
import sectionsTransformer from './transformers/pfizerforall-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'columns-intro': columnsIntroParser,
  'cards-action': cardsActionParser,
  'carousel-condition': carouselConditionParser,
  'columns-media': columnsMediaParser,
  'columns-banner': columnsBannerParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Pfizer For All homepage: hero slideshow with brand intro, action cards, condition carousel, two media/text splits, and a Health Answers banner',
  urls: [
    'https://www.pfizerforall.com/',
  ],
  blocks: [
    { name: 'carousel-hero', instances: ['.hero.has-carousel .hero-image-and-info-container'] },
    { name: 'columns-intro', instances: ['.hero.has-carousel .hero-content'] },
    { name: 'cards-action', instances: ['.card-grid .cards-grid-container'] },
    { name: 'carousel-condition', instances: ['.content-cards-carousel.block'] },
    { name: 'columns-media', instances: ['.image-1-2-wrapper'] },
    { name: 'columns-banner', instances: ['.banner-1-2-wrapper'] },
  ],
  sections: [
    {
      id: 'rc2',
      name: 'hero',
      selector: ['.section.hero-container'],
      style: null,
      blocks: ['carousel-hero', 'columns-intro'],
      defaultContent: [],
    },
    {
      id: 'rc3',
      name: 'next-step-cards',
      selector: ['.section.card-grid-container'],
      style: null,
      blocks: ['cards-action'],
      defaultContent: ['.card-grid .card-grid-content-container'],
    },
    {
      id: 'rc4',
      name: 'condition-carousel',
      selector: ['.section.content-cards-carousel-container'],
      style: null,
      blocks: ['carousel-condition'],
      defaultContent: [],
    },
    {
      id: 'rc5',
      name: 'self-pay-savings',
      selector: ['.section.image-1-2-container:nth-of-type(4)'],
      style: null,
      blocks: ['columns-media'],
      defaultContent: [],
    },
    {
      id: 'rc6',
      name: 'prescription-savings',
      selector: ['.section.image-1-2-container:nth-of-type(5)'],
      style: null,
      blocks: ['columns-media'],
      defaultContent: [],
    },
    {
      id: 'rc7',
      name: 'health-answers-banner',
      selector: ['.section.banner-1-2-container'],
      style: null,
      blocks: ['columns-banner'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Initial cleanup + section breaks (before parsers replace elements)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (root URL maps to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
