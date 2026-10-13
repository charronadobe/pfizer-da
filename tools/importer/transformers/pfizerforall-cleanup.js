/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: pfizerforall.com site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const YT_ID_PATTERNS = [
  /youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/,
  /youtube\.com\/watch\?(?:[^#]*&)?v=([\w-]{6,})/,
  /youtu\.be\/([\w-]{6,})/,
];

/** Find a YouTube video id in any attribute (src, data-*) of el or its descendants. */
function findYouTubeId(el) {
  const nodes = [el, ...el.querySelectorAll('*')];
  for (const node of nodes) {
    for (const attr of [...node.attributes]) {
      if (/^(data-)?(video-?)?id$/i.test(attr.name) && /^[\w-]{11}$/.test(attr.value)
        && node.closest('.video-element-youtube, [class*="youtube"]')) {
        return attr.value;
      }
      for (const re of YT_ID_PATTERNS) {
        const m = attr.value.match(re);
        if (m) return m[1];
      }
    }
  }
  return null;
}

/**
 * Absolute live URL of the source page, without query and hash
 * (e.g. https://www.pfizerforall.com/savings-support/self-pay). null if unknown.
 */
function getLivePageUrl(payload) {
  const candidates = [payload && payload.params && payload.params.originalURL, payload && payload.url];
  for (const c of candidates) {
    if (!c) continue;
    try {
      const u = new URL(c);
      if (!/^https?:$/.test(u.protocol)) continue;
      u.search = '';
      u.hash = '';
      return u.href;
    } catch (e) { /* try next */ }
  }
  return null;
}

/** Source page pathname without trailing slash ('' for the site root). */
function getPagePath(payload) {
  const candidates = [payload && payload.params && payload.params.originalURL, payload && payload.url];
  for (const c of candidates) {
    if (!c) continue;
    try {
      return new URL(c).pathname.replace(/\/+$/, '');
    } catch (e) { /* try next */ }
  }
  // Last resort: the rendered page's own location (importer proxy keeps the source path).
  try {
    const loc = document.location;
    if (loc && /^https?:$/.test(loc.protocol)) return loc.pathname.replace(/\/+$/, '');
  } catch (e) { /* no location */ }
  return null;
}

/** Clean, detached copy of a popup's authorable content (no close button / modal chrome). */
function clonePopupContent(doc, popup) {
  const source = popup.querySelector('.popup-modal-body') || popup.querySelector('.popup-modal-content') || popup;
  const out = doc.createElement('div');
  const CONTENT = 'h1, h2, h3, h4, h5, h6, p, ul, ol, picture, img';
  [...source.querySelectorAll(CONTENT)]
    .filter((el) => !el.closest('.popup-modal-close') && !el.parentElement.closest(CONTENT))
    .forEach((el) => out.append(el.cloneNode(true)));
  // Strip runtime attributes / wrappers added by the source site's JS.
  out.querySelectorAll('button, .icon, svg').forEach((el) => el.remove());
  out.querySelectorAll('a span').forEach((span) => span.replaceWith(...span.childNodes));
  out.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (/^(data-|style$|class$|id$)/.test(attr.name)) el.removeAttribute(attr.name);
    });
  });
  return out;
}

function createLinkParagraph(doc, href, text) {
  const p = doc.createElement('p');
  const a = doc.createElement('a');
  a.href = href;
  a.textContent = text;
  p.append(a);
  return p;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent (OneTrust): <div id="onetrust-consent-sdk"> (line ~1149)
    // Site overlay/dialog host: <div class="core-overlay-host-wrapper block-wrapper"> (line ~1118)
    // (all .core-overlay-host-wrapper instances are removed; /vaccines/ renders two)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.core-overlay-host-wrapper',
    ]);

    // Content pages (verified on live /cancer, /vaccines/, /find-care/*, /savings-support/self-pay;
    // none of these exist on the homepage, so home output is unchanged):
    // - Hero breadcrumb <nav class="breadcrumb"> inside <div class="hero-inner-container">;
    //   the hero-page block builds the breadcrumb from the URL path.
    // - Sticky dropdown clone appended to <body>: <div class="hero-sticky-dropdown-clone no-index">
    //   (/find-care/prepare-for-care, /find-care/talk-to-a-doctor). The original
    //   .hero-dropdown-container inside the hero is kept for the hero-page parser.
    // - Dark ("relief mode") duplicate images: <div class="image-container"> holds
    //   <div class="image-default"> + <div class="image-relief"> (/cancer, /vaccines/).
    //   Keep only the default/light pair.
    WebImporter.DOMUtils.remove(element, [
      '.hero-inner-container > nav.breadcrumb',
      '.hero-sticky-dropdown-clone',
      '.image-container > .image-relief',
    ]);

    // A/B experiment placeholder sections: bare <div class="section" data-section-status="activated"
    // data-main-section-layout-container="true"> with no content (/cancer, /find-care/biomarker-testing/).
    element.querySelectorAll('#main > div.section').forEach((section) => {
      if (section.className.trim() === 'section'
        && !section.children.length
        && !section.textContent.trim()) {
        section.remove();
      }
    });

    const doc = element.ownerDocument || document;

    // YouTube video block (/find-care/biomarker-testing/, A/B arm variant-challenger-1):
    // <div class="video-1-1 block"> > .video-1-1-player-host > .video-element.video-element-youtube
    //   > iframe.video-element-player[src="https://www.youtube-nocookie.com/embed/<id>?..."]
    // plus a poster <div class="video-1-1-placeholder"><picture>. Replace the whole block with a
    // plain YouTube link (scripts.js auto-blocks it into an embed); the poster is dropped.
    element.querySelectorAll('.video-1-1.block').forEach((block) => {
      const id = findYouTubeId(block);
      if (!id) return; // no recognizable video: leave untouched rather than lose content
      const url = `https://www.youtube.com/watch?v=${id}`;
      block.replaceWith(createLinkParagraph(doc, url, url));
    });

    // Rx savings search (/savings-support/self-pay): <div class="rx-search-results block">
    //   > .rx-search-content-container > .rx-search-content-section > .rx-search-content-type-stack (h2 + p, kept)
    //                                  > .rx-search-action-section (type-ahead input, ~36 dropdown items,
    //                                    "Popular Searches" chips; removed)
    //   > .rx-search-cards-container (results; removed)
    // A link to the live tool replaces the widget; link text = the widget's own label.
    // The tool lives on every page that renders it, so the link targets the CURRENT source page's
    // live URL (params.originalURL without query/hash).
    // In-page links to the search (e.g. /savings-support/prescription-assistance hero/card
    // "Look up my medication" -> href="#spend-less-however-you-want-to-pay", the id of
    // <div class="section rx-search-results-container" id="spend-less-however-you-want-to-pay">)
    // are rewritten to the same live URL so they don't become dead anchors.
    const rxBlocks = [...element.querySelectorAll('.rx-search-results.block')];
    if (rxBlocks.length) {
      const toolUrl = getLivePageUrl(payload);
      if (!toolUrl) console.warn('pfizerforall-cleanup: no source URL, Rx search link omitted');
      const rxIds = new Set();
      rxBlocks.forEach((block) => {
        [block, block.closest('.rx-search-results-wrapper'), block.closest('#main > div.section')]
          .forEach((el) => { if (el && el.id) rxIds.add(el.id); });
      });

      rxBlocks.forEach((block) => {
        const action = block.querySelector('.rx-search-action-section');
        const labelEl = block.querySelector('.type-ahead__label');
        const input = block.querySelector('input.type-ahead__field');
        const label = (labelEl && labelEl.textContent.trim())
          || (input && (input.getAttribute('aria-label') || input.getAttribute('placeholder') || '').trim())
          || '';
        const typeStack = block.querySelector('.rx-search-content-type-stack');
        if (toolUrl && label && (typeStack || action)) {
          const p = createLinkParagraph(doc, toolUrl, label);
          if (typeStack) typeStack.append(p);
          else action.before(p);
        }
        block.querySelectorAll('.rx-search-action-section, .rx-search-cards-container')
          .forEach((el) => el.remove());
      });

      if (toolUrl && rxIds.size) {
        element.querySelectorAll('a[href*="#"]').forEach((a) => {
          let hash;
          try {
            hash = decodeURIComponent(new URL(a.getAttribute('href'), toolUrl).hash.slice(1));
          } catch (e) {
            return;
          }
          if (rxIds.has(hash)) a.setAttribute('href', toolUrl);
        });
      }
    }

    // Hidden "copay" icon list (/savings-support/prescription-assistance):
    // <div class="section icon-list-container"> > .icon-list-wrapper >
    //   <div class="icon-list two-column core-icon copay block"> — display:none by default, only
    // revealed by certain Rx search results. Match the default view: drop the section.
    // (Other icon lists, e.g. prepare-for-care / self-pay "icon-list core-icon", have no copay class.)
    element.querySelectorAll('#main > div.section.icon-list-container').forEach((section) => {
      if (section.querySelector('.icon-list.copay')) section.remove();
    });

    // Popup modals (/find-care/cancer-screening/): hidden
    //   <div class="section popup-modal-container"> > .popup-modal-wrapper
    //     > <div class="popup-modal ... block" id="schedule-breast-screening" style="display:none">
    //         > .popup-modal-content > button.popup-modal-close + .popup-modal-body (h2, p, p.button-container a)
    // opened by in-page links such as <a href="/#schedule-breast-screening"> (hash = popup id).
    // On EDS each popup becomes a fragment document opened by blocks/modal (links ending in #_dnb
    // are not auto-inlined by loadFragments).
    //
    // CONTRACT with the import script:
    //   payload.params.fragments: Array<{ path: string, element: HTMLDivElement }>
    //     path    - document path of the fragment, '/fragments<pagePath>/<popupId>'
    //               (pagePath = source pathname without trailing slash, from params.originalURL)
    //     element - new detached <div> with a clean clone of the popup content (headings,
    //               paragraphs, links; no close button, icons, classes or data-* attributes)
    //   The array lives on payload.params because executeTransformers passes a shallow copy
    //   ({ ...payload, template }) to each transformer; params is the shared object. Existing
    //   entries are preserved (appended to). Only set when the page has popups.
    const popups = [...element.querySelectorAll('.popup-modal.block[id]')];
    if (popups.length) {
      let pagePath = getPagePath(payload);
      if (pagePath === null) {
        // Should not happen in the importer (params.originalURL is always set); keep the content
        // and use site-level fragment paths rather than importing the popups inline.
        console.warn('pfizerforall-cleanup: no source URL, popup fragments use /fragments/<id>');
        pagePath = '';
      }
      const ids = new Set(popups.map((p) => p.id));
      const base = (payload.params && payload.params.originalURL) || payload.url;

      // 1. Rewrite links whose hash is a popup id on this page.
      element.querySelectorAll('a[href*="#"]').forEach((a) => {
        if (a.closest('.popup-modal')) return;
        let hash;
        try {
          hash = decodeURIComponent(new URL(a.getAttribute('href'), base).hash.slice(1));
        } catch (e) {
          return;
        }
        if (ids.has(hash)) a.setAttribute('href', `/fragments${pagePath}/${hash}#_dnb`);
      });

      // 2. Export popup content before removal.
      if (!payload.params) payload.params = {};
      const fragments = payload.params.fragments || (payload.params.fragments = []);
      popups.forEach((popup) => {
        fragments.push({
          path: `/fragments${pagePath}/${popup.id}`,
          element: clonePopupContent(doc, popup),
        });
      });

      // 3. Remove the popup sections so they don't import inline.
      popups.forEach((popup) => {
        const host = popup.closest('#main > div.section.popup-modal-container')
          || popup.closest('.popup-modal-wrapper')
          || popup;
        host.remove();
      });
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome:
    // <header class="layout-header nav-container header-wrapper block-wrapper"> containing <div class="header block no-index">
    // <footer class="footer-wrapper block-wrapper">
    WebImporter.DOMUtils.remove(element, [
      'header.layout-header',
      'div.header.block',
      'footer.footer-wrapper',
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
