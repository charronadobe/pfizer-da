/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroQuizParser from './parsers/hero-quiz.js';
import cardsIconParser from './parsers/cards-icon.js';
import columnsCalloutParser from './parsers/columns-callout.js';
import cardsCarouselParser from './parsers/cards-carousel.js';
import accordionFaqParser from './parsers/accordion-faq.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/pfizerforall-cleanup.js';
import sectionsTransformer from './transformers/pfizerforall-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-quiz': heroQuizParser,
  'cards-icon': cardsIconParser,
  'columns-callout': columnsCalloutParser,
  'cards-carousel': cardsCarouselParser,
  'accordion-faq': accordionFaqParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
// Sections are class-based rules; one rule can match several sections on a page
// (see transformers/pfizerforall-sections.js).
const PAGE_TEMPLATE = {
  name: "cancer-screening",
  description: "Cancer screening landing page",
  urls: [
    "https://www.pfizerforall.com/find-care/cancer-screening/"
  ],
  blocks: [
    {
      name: "hero-quiz",
      instances: [
        "#main > div.section.oncology-quiz-card-container .oncology-quiz-card.block"
      ]
    },
    {
      name: "cards-icon",
      instances: [
        "#main > div.section.icon-list-container .icon-list.block"
      ]
    },
    {
      name: "columns-callout",
      instances: [
        "#main > div.section.content-card-container .content-card.block"
      ]
    },
    {
      name: "cards-carousel",
      instances: [
        "#main > div.section.cards-carousel-container .cards-carousel.block"
      ]
    },
    {
      name: "accordion-faq",
      instances: [
        "#main > div.section.accordion-card-1-1-container .accordion-card-1-1.block"
      ]
    }
  ],
  sections: [
    {
      id: "cs-hero",
      name: "quiz hero",
      selector: [
        "#main > div.section.oncology-quiz-card-container"
      ],
      style: "core",
      blocks: [
        "hero-quiz"
      ],
      defaultContent: []
    },
    {
      id: "cs-icon-list",
      name: "why screening matters",
      selector: [
        "#main > div.section.icon-list-container"
      ],
      style: null,
      blocks: [
        "cards-icon"
      ],
      defaultContent: []
    },
    {
      id: "cs-video",
      name: "video",
      selector: [
        "#main > div.section.video-1-1-container"
      ],
      style: null,
      blocks: [],
      defaultContent: [
        ".video-1-1"
      ]
    },
    {
      id: "cs-callout",
      name: "proudly supporting",
      selector: [
        "#main > div.section.content-card-container"
      ],
      style: null,
      blocks: [
        "columns-callout"
      ],
      defaultContent: []
    },
    {
      id: "cs-screenings",
      name: "what screenings are there",
      selector: [
        "#main > div.section.cards-carousel-container"
      ],
      style: "light-blue",
      blocks: [
        "cards-carousel"
      ],
      defaultContent: [
        ".cards-carousel-content-section"
      ]
    },
    {
      id: "cs-popups",
      name: "schedule popups (exported as fragments)",
      selector: [
        "#main > div.section.popup-modal-container"
      ],
      style: null,
      blocks: [],
      defaultContent: []
    },
    {
      id: "cs-cost",
      name: "what does it cost",
      selector: [
        "#main > div.section.accordion-card-1-1-container"
      ],
      style: null,
      blocks: [
        "accordion-faq"
      ],
      defaultContent: []
    },
    {
      id: "cs-disclaimer",
      name: "disclaimer",
      selector: [
        "#main > div.section.rich-text-container"
      ],
      style: null,
      blocks: [],
      defaultContent: [
        ".rich-text"
      ]
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

    // Popup modals (params.fragments, exported by the cleanup transformer) are imported as
    // their own documents by import-cancer-screening-fragments.js; the page links to them.
    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
        fragments: (params.fragments || []).map((f) => f.path).join(', '),
      },
    }];
  },
};
