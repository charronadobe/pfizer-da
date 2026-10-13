/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPageParser from './parsers/hero-page.js';
import cardsCarouselParser from './parsers/cards-carousel.js';
import cardsArticleParser from './parsers/cards-article.js';
import columnsMediaParser from './parsers/columns-media.js';
import heroArticleParser from './parsers/hero-article.js';
import bannerCtaParser from './parsers/banner-cta.js';
import cardsNavParser from './parsers/cards-nav.js';
import cardsActionParser from './parsers/cards-action.js';
import quizChoiceParser from './parsers/quiz-choice.js';
import columnsArticleParser from './parsers/columns-article.js';
import quizTruefalseParser from './parsers/quiz-truefalse.js';
import formSignupParser from './parsers/form-signup.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import searchPromptParser from './parsers/search-prompt.js';
import quizEntryParser from './parsers/quiz-entry.js';
import cardsFactParser from './parsers/cards-fact.js';
import quotePhotoParser from './parsers/quote-photo.js';
import cardsIconParser from './parsers/cards-icon.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/pfizerforall-cleanup.js';
import sectionsTransformer from './transformers/pfizerforall-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-page': heroPageParser,
  'cards-carousel': cardsCarouselParser,
  'cards-article': cardsArticleParser,
  'columns-media': columnsMediaParser,
  'hero-article': heroArticleParser,
  'banner-cta': bannerCtaParser,
  'cards-nav': cardsNavParser,
  'cards-action': cardsActionParser,
  'quiz-choice': quizChoiceParser,
  'columns-article': columnsArticleParser,
  'quiz-truefalse': quizTruefalseParser,
  'form-signup': formSignupParser,
  'accordion-faq': accordionFaqParser,
  'search-prompt': searchPromptParser,
  'quiz-entry': quizEntryParser,
  'cards-fact': cardsFactParser,
  'quote-photo': quotePhotoParser,
  'cards-icon': cardsIconParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
// Sections are class-based rules; one rule can match several sections on a page
// (see transformers/pfizerforall-sections.js).
const PAGE_TEMPLATE = {
  name: "content-page",
  description: "Section landing/content pages (Cancer, Vaccines, Find Care, Self-Pay)",
  urls: [
    "https://www.pfizerforall.com/cancer",
    "https://www.pfizerforall.com/find-care/biomarker-testing/",
    "https://www.pfizerforall.com/find-care/prepare-for-care",
    "https://www.pfizerforall.com/find-care/talk-to-a-doctor",
    "https://www.pfizerforall.com/savings-support/self-pay",
    "https://www.pfizerforall.com/vaccines/"
  ],
  blocks: [
    {
      name: "hero-page",
      instances: [
        "#main > div.section.hero-container .hero.block"
      ]
    },
    {
      name: "cards-carousel",
      instances: [
        "#main > div.section.cards-carousel-container .cards-carousel.block:not(.dynamic-article)"
      ]
    },
    {
      name: "cards-article",
      instances: [
        "#main > div.section.cards-carousel-container .cards-carousel.block.dynamic-article"
      ]
    },
    {
      name: "columns-media",
      instances: [
        "#main > div.section.image-1-1-container .image-1-1.block",
        "#main > div.section.image-1-2-container .image-1-2.block"
      ]
    },
    {
      name: "hero-article",
      instances: [
        "#main > div.section.featured-article-container .featured-article.block"
      ]
    },
    {
      name: "banner-cta",
      instances: [
        "#main > div.section.banner-container .banner.block",
        "#main > div.section.banner-vaxassist-container .banner-vaxassist.block"
      ]
    },
    {
      name: "cards-nav",
      instances: [
        "#main > div.section.card-grid-container .card-grid.block.navigation",
        "#main > div.section.card-grid-container .card-grid.block.core-title-icon"
      ]
    },
    {
      name: "cards-action",
      instances: [
        "#main > div.section.card-grid-container .card-grid.block:not(.navigation):not(.core-title-icon):not(.dynamic-article)"
      ]
    },
    {
      name: "quiz-choice",
      instances: [
        "#main > div.section.question-1-6-container .question-1-6.block"
      ]
    },
    {
      name: "columns-article",
      instances: [
        "#main > div.section.image-1-5-container .image-1-5.block"
      ]
    },
    {
      name: "quiz-truefalse",
      instances: [
        "#main > div.section.true-false-container .true-false.block",
        "#main > div.section.question-1-2-container .question-1-2.block"
      ]
    },
    {
      name: "form-signup",
      instances: [
        "#main > div.section.form-container .form.block"
      ]
    },
    {
      name: "accordion-faq",
      instances: [
        "#main > div.section.accordion-basic-container .accordion-basic.block"
      ]
    },
    {
      name: "search-prompt",
      instances: [
        "#main > div.section.search-block-text-2-1-container .search-block-text-2-1-search"
      ]
    },
    {
      name: "quiz-entry",
      instances: [
        "#main > div.section.entry-quiz-container .entry-quiz.block"
      ]
    },
    {
      name: "cards-fact",
      instances: [
        "#main > div.section.vertical-card-container .vertical-card.block"
      ]
    },
    {
      name: "quote-photo",
      instances: [
        "#main > div.section.quote-container .quote.block"
      ]
    },
    {
      name: "cards-icon",
      instances: [
        "#main > div.section.icon-list-container .icon-list.block"
      ]
    }
  ],
  sections: [
    {
      id: "cp-hero",
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
      id: "cp-cards-carousel",
      name: "cards-carousel",
      selector: [
        "#main > div.section.cards-carousel-container"
      ],
      style: null,
      blocks: [
        "cards-carousel",
        "cards-article"
      ],
      defaultContent: [
        ".cards-carousel-content-section"
      ]
    },
    {
      id: "cp-image-1-1-light",
      name: "image-text (light blue)",
      selector: [
        "#main > div.section.image-1-1-container:has(.image-1-1.core-lighter)"
      ],
      style: "light-blue",
      blocks: [
        "columns-media"
      ],
      defaultContent: []
    },
    {
      id: "cp-image-1-1",
      name: "image-text",
      selector: [
        "#main > div.section.image-1-1-container:not(:has(.image-1-1.core-lighter))"
      ],
      style: null,
      blocks: [
        "columns-media"
      ],
      defaultContent: []
    },
    {
      id: "cp-image-1-2",
      name: "image-text (1:2)",
      selector: [
        "#main > div.section.image-1-2-container"
      ],
      style: null,
      blocks: [
        "columns-media"
      ],
      defaultContent: []
    },
    {
      id: "cp-featured-article",
      name: "featured article",
      selector: [
        "#main > div.section.featured-article-container"
      ],
      style: null,
      blocks: [
        "hero-article"
      ],
      defaultContent: []
    },
    {
      id: "cp-banner",
      name: "cta banner",
      selector: [
        "#main > div.section.banner-container",
        "#main > div.section.banner-vaxassist-container"
      ],
      style: null,
      blocks: [
        "banner-cta"
      ],
      defaultContent: []
    },
    {
      id: "cp-card-grid-light",
      name: "card grid (light blue)",
      selector: [
        "#main > div.section.card-grid-container:has(.card-grid.core-lighter)"
      ],
      style: "light-blue",
      blocks: [
        "cards-nav"
      ],
      defaultContent: [
        ".card-grid-content-container"
      ]
    },
    {
      id: "cp-card-grid",
      name: "card grid",
      selector: [
        "#main > div.section.card-grid-container:not(:has(.card-grid.core-lighter))"
      ],
      style: null,
      blocks: [
        "cards-nav",
        "cards-action"
      ],
      defaultContent: [
        ".card-grid-content-container"
      ]
    },
    {
      id: "cp-question-choice",
      name: "choice quiz",
      selector: [
        "#main > div.section.question-1-6-container"
      ],
      style: "light-blue",
      blocks: [
        "quiz-choice"
      ],
      defaultContent: []
    },
    {
      id: "cp-image-1-5",
      name: "featured article split",
      selector: [
        "#main > div.section.image-1-5-container"
      ],
      style: null,
      blocks: [
        "columns-article"
      ],
      defaultContent: []
    },
    {
      id: "cp-true-false",
      name: "true/false quiz (inset card)",
      selector: [
        "#main > div.section.true-false-container"
      ],
      style: null,
      blocks: [
        "quiz-truefalse"
      ],
      defaultContent: []
    },
    {
      id: "cp-true-false-band",
      name: "true/false quiz (full-width band)",
      selector: [
        "#main > div.section.question-1-2-container"
      ],
      style: "light-blue",
      blocks: [
        "quiz-truefalse"
      ],
      defaultContent: []
    },
    {
      id: "cp-form",
      name: "sign-up form",
      selector: [
        "#main > div.section.form-container"
      ],
      style: null,
      blocks: [
        "form-signup"
      ],
      defaultContent: []
    },
    {
      id: "cp-accordion",
      name: "faq",
      selector: [
        "#main > div.section.accordion-basic-container"
      ],
      style: null,
      blocks: [
        "accordion-faq"
      ],
      defaultContent: [
        ".accordion-basic-content-section"
      ]
    },
    {
      id: "cp-search",
      name: "search prompt",
      selector: [
        "#main > div.section.search-block-text-2-1-container"
      ],
      style: null,
      blocks: [
        "search-prompt"
      ],
      defaultContent: [
        ".search-block-text-2-1-type-stack"
      ]
    },
    {
      id: "cp-entry-quiz",
      name: "entry quiz",
      selector: [
        "#main > div.section.entry-quiz-container"
      ],
      style: null,
      blocks: [
        "quiz-entry"
      ],
      defaultContent: []
    },
    {
      id: "cp-vertical-card",
      name: "fact cards",
      selector: [
        "#main > div.section.vertical-card-container"
      ],
      style: null,
      blocks: [
        "cards-fact"
      ],
      defaultContent: []
    },
    {
      id: "cp-quote",
      name: "quote",
      selector: [
        "#main > div.section.quote-container"
      ],
      style: null,
      blocks: [
        "quote-photo"
      ],
      defaultContent: []
    },
    {
      id: "cp-video",
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
      id: "cp-banner-2-1-quote",
      name: "quote (no photo)",
      selector: [
        "#main > div.section.banner-2-1-container:has(.banner-2-1.quote-heading)"
      ],
      style: "quote",
      blocks: [],
      defaultContent: [
        ".banner-2-1"
      ]
    },
    {
      id: "cp-banner-2-1",
      name: "inline cta",
      selector: [
        "#main > div.section.banner-2-1-container:not(:has(.banner-2-1.quote-heading))"
      ],
      style: "cta-inline",
      blocks: [],
      defaultContent: [
        ".banner-2-1"
      ]
    },
    {
      id: "cp-icon-list",
      name: "icon list",
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
      id: "cp-rx-search",
      name: "rx savings search",
      selector: [
        "#main > div.section.rx-search-results-container"
      ],
      style: "blue",
      blocks: [],
      defaultContent: [
        ".rx-search-results"
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
