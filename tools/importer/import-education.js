/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPageParser from './parsers/hero-page.js';
import carouselConditionParser from './parsers/carousel-condition.js';
import cardsFeedParser from './parsers/cards-feed.js';
import cardsActionParser from './parsers/cards-action.js';
import bannerCtaParser from './parsers/banner-cta.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/pfizerforall-cleanup.js';
import sectionsTransformer from './transformers/pfizerforall-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-page': heroPageParser,
  'carousel-condition': carouselConditionParser,
  'cards-feed': cardsFeedParser,
  'cards-action': cardsActionParser,
  'banner-cta': bannerCtaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
// Sections are class-based rules; one rule can match several sections on a page
// (see transformers/pfizerforall-sections.js).
const PAGE_TEMPLATE = {
  name: "education",
  description: "Health Information Center article hub",
  urls: [
    "https://www.pfizerforall.com/education/"
  ],
  blocks: [
    {
      name: "hero-page",
      instances: [
        "#main > div.section.hero-container .hero.block"
      ]
    },
    {
      name: "carousel-condition",
      instances: [
        "#main > div.section.content-cards-carousel-container .content-cards-carousel.block"
      ]
    },
    {
      name: "cards-feed",
      instances: [
        "#main > div.section.card-grid-container .card-grid.block.dynamic-article"
      ]
    },
    {
      name: "cards-action",
      instances: [
        "#main > div.section.card-grid-container .card-grid.block:not(.dynamic-article)"
      ]
    },
    {
      name: "banner-cta",
      instances: [
        "#main > div.section.banner-container .banner.block"
      ]
    }
  ],
  sections: [
    {
      id: "ed-hero",
      name: "hero",
      selector: [
        "#main > div.section.hero-container"
      ],
      style: null,
      blocks: [
        "hero-page"
      ],
      defaultContent: []
    },
    {
      id: "ed-carousel",
      name: "latest articles carousel",
      selector: [
        "#main > div.section.content-cards-carousel-container"
      ],
      style: null,
      blocks: [
        "carousel-condition"
      ],
      defaultContent: []
    },
    {
      id: "ed-feed",
      name: "explore all",
      selector: [
        "#main > div.section.card-grid-container:has(.card-grid.dynamic-article)"
      ],
      style: null,
      blocks: [
        "cards-feed"
      ],
      defaultContent: [
        ".card-grid-content-container"
      ]
    },
    {
      id: "ed-connect",
      name: "connect to care",
      selector: [
        "#main > div.section.card-grid-container:not(:has(.card-grid.dynamic-article))"
      ],
      style: null,
      blocks: [
        "cards-action"
      ],
      defaultContent: [
        ".card-grid-content-container"
      ]
    },
    {
      id: "ed-banner",
      name: "cta banner",
      selector: [
        "#main > div.section.banner-container"
      ],
      style: null,
      blocks: [
        "banner-cta"
      ],
      defaultContent: []
    }
  ]
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

    // 0. A/B experiments (aem-experimentation) swap the page content client-side and the
    //    source ignores the force parameter. Only the control arm is the authored page, so
    //    fail the import of any challenger arm; re-running the import picks a new arm.
    const arm = [...document.body.classList].find((c) => c.startsWith('variant-'));
    if (arm && arm !== 'variant-control') {
      throw new Error(`Experiment arm "${arm}" captured instead of control for ${params.originalURL}; re-run the import`);
    }

    const main = document.body;

    // The hero-page block builds "Home / <label>": keep the source breadcrumb's label as
    // Breadcrumb-Title, or turn it off where the source has none (read before cleanup removes it).
    const sourceCrumb = document.querySelector('#main nav.breadcrumb');
    const crumbLabel = sourceCrumb?.querySelector('[aria-current="page"], .breadcrumb__current')?.textContent.trim() || '';

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
    const metadataTable = [...main.querySelectorAll('table')].reverse()
      .find((t) => t.rows[0]?.textContent.trim().toLowerCase() === 'metadata');
    if (metadataTable && (!sourceCrumb || crumbLabel)) {
      const row = metadataTable.insertRow();
      row.insertCell().textContent = sourceCrumb ? 'Breadcrumb-Title' : 'Breadcrumb';
      row.insertCell().textContent = sourceCrumb ? crumbLabel : 'off';
    }
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
