/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document: document2 }) {
    const slides = [...element.querySelectorAll(".hero-overlay-slide")];
    const backgrounds = [...element.querySelectorAll(".hero-carousel-backgrounds > .hero-carousel-background-item, .hero-carousel-background-item")].filter((el, idx, arr) => arr.indexOf(el) === idx);
    const videoLink = (src) => {
      const a = document2.createElement("a");
      a.href = src;
      a.textContent = src;
      return a;
    };
    const getPictures = (scope, desktopSel, mobileSel) => {
      if (!scope) return [];
      const out = [];
      const desktop = scope.querySelector(desktopSel);
      const mobile = scope.querySelector(mobileSel);
      if (desktop || mobile) {
        [desktop, mobile].forEach((wrap) => {
          const pic = wrap && (wrap.querySelector("picture") || wrap.querySelector("img"));
          if (pic) out.push(pic);
        });
      } else {
        scope.querySelectorAll("picture").forEach((pic) => out.push(pic));
        if (!out.length) scope.querySelectorAll('img:not([src^="data:"])').forEach((img) => out.push(img));
      }
      return out;
    };
    const getVideoSrc = (scope) => {
      if (!scope) return null;
      const source = scope.querySelector('video source[src], source[src$=".mp4"]');
      if (source) return source.getAttribute("src");
      const video = scope.querySelector("video[src]");
      return video ? video.getAttribute("src") : null;
    };
    const cells = [];
    slides.forEach((slide, idx) => {
      const bg = backgrounds[idx] || null;
      const mediaCell = [];
      const videoSrc = slide.classList.contains("has-background-video") || !slide.querySelector(".hero-overlay-slide-background") ? getVideoSrc(bg) : null;
      if (videoSrc) {
        mediaCell.push(videoLink(videoSrc));
      } else {
        let pics = getPictures(
          slide.querySelector(".hero-overlay-slide-background"),
          ".hero-overlay-slide-background-desktop",
          ".hero-overlay-slide-background-mobile"
        );
        if (!pics.length) {
          pics = getPictures(bg, ".hero-carousel-background-desktop", ".hero-carousel-background-mobile");
        }
        mediaCell.push(...pics);
        if (!pics.length) {
          const fallbackVideo = getVideoSrc(bg);
          if (fallbackVideo) mediaCell.push(videoLink(fallbackVideo));
        }
      }
      const contentCell = [];
      const heading = slide.querySelector(".hero-overlay-headline-container h1, .hero-overlay-headline-container h2, .hero-overlay-headline-container h3") || slide.querySelector("h1, h2, h3");
      if (heading) contentCell.push(heading);
      const body = slide.querySelector(".hero-overlay-body-container");
      if (body) {
        const paras = [...body.querySelectorAll("p")];
        if (paras.length) contentCell.push(...paras);
        else if (body.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = body.textContent.trim();
          contentCell.push(p);
        }
      }
      const ctas = [...slide.querySelectorAll(".hero-overlay-button-group a[href]")];
      ctas.forEach((a) => {
        const p = document2.createElement("p");
        p.append(a);
        contentCell.push(p);
      });
      if (!mediaCell.length && !contentCell.length) return;
      cells.push([mediaCell.length ? mediaCell : "", contentCell.length ? contentCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-intro.js
  function parse2(element, { document: document2 }) {
    const pictureWrap = element.querySelector(".hero-content-picture-wrapper");
    const contentWrap = element.querySelector(".hero-rich-content-wrapper") || element.querySelector(".hero-content-container");
    const imageCell = [];
    if (pictureWrap) {
      const picture = pictureWrap.querySelector("picture");
      const img = pictureWrap.querySelector("img");
      if (picture) {
        imageCell.push(picture);
      } else if (img || pictureWrap.querySelector("span.icon")) {
        const iconSpan = pictureWrap.querySelector("span.icon");
        const iconClass = iconSpan && [...iconSpan.classList].find((c) => c.startsWith("icon-") && c !== "icon");
        const iconName = iconClass ? iconClass.replace(/^icon-/, "") : null;
        const rawSrc = img ? img.getAttribute("src") : "";
        let src = null;
        if (iconName) src = `https://www.pfizerforall.com/assets/icons/${iconName}.svg?format=svg`;
        else if (rawSrc && !rawSrc.startsWith("data:")) src = rawSrc.endsWith(".svg") ? `${rawSrc}?format=svg` : rawSrc;
        if (src) {
          const logo = document2.createElement("img");
          logo.src = src;
          logo.alt = img && img.getAttribute("alt") || "PfizerForAll";
          imageCell.push(logo);
        }
      }
    }
    const textCell = [];
    if (contentWrap) {
      const heading = contentWrap.querySelector("h1, h2, h3, h4");
      if (heading) textCell.push(heading);
      contentWrap.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim() || p.querySelector("a, img")) textCell.push(p);
      });
      contentWrap.querySelectorAll("a.button").forEach((a) => {
        if (!textCell.some((el) => el.contains(a))) textCell.push(a);
      });
    }
    if (!imageCell.length && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[imageCell.length ? imageCell : "", textCell.length ? textCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-intro", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-action.js
  function parse3(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(":scope > .card")];
    if (!cards.length) cards = [...element.querySelectorAll(".card")];
    const buildIcon = (card) => {
      const iconWrap = card.querySelector(".card-icon");
      if (!iconWrap) return null;
      const picture = iconWrap.querySelector("picture");
      if (picture) return picture;
      const img = iconWrap.querySelector("img");
      const span = iconWrap.querySelector("span.icon");
      const iconClass = span && [...span.classList].find((c) => c.startsWith("icon-"));
      const name = iconClass ? iconClass.replace(/^icon-/, "") : null;
      const raw = img ? img.getAttribute("src") : "";
      let src = null;
      if (name) src = `https://www.pfizerforall.com/assets/icons/${name}.svg?format=svg`;
      else if (raw && !raw.startsWith("data:")) src = raw.endsWith(".svg") ? `${raw}?format=svg` : raw;
      if (!src) return null;
      const icon = document2.createElement("img");
      icon.src = src;
      icon.alt = img && img.getAttribute("alt") || "";
      return icon;
    };
    const cells = [];
    cards.forEach((card) => {
      const icon = buildIcon(card);
      const content = card.querySelector(".card-content") || card;
      const textCell = [];
      const heading = content.querySelector(".card-headline-container h1, .card-headline-container h2, .card-headline-container h3, .card-headline-container h4") || content.querySelector("h2, h3, h4");
      if (heading) textCell.push(heading);
      const body = content.querySelector(".card-body-container");
      if (body) body.querySelectorAll("p").forEach((p) => textCell.push(p));
      let ctas = [...content.querySelectorAll(".button-container a[href], a.button[href]")].filter((a, i, arr) => arr.indexOf(a) === i);
      if (!ctas.length) {
        const overlay = card.querySelector("a.card-link[href]");
        if (overlay && heading) {
          const a = document2.createElement("a");
          a.href = overlay.getAttribute("href");
          a.textContent = heading.textContent.trim();
          ctas = [a];
        }
      }
      ctas.forEach((a) => {
        const p = document2.createElement("p");
        p.append(a);
        textCell.push(p);
      });
      if (!icon && !textCell.length) return;
      cells.push([icon || "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-action", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-condition.js
  function parse4(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(":scope > .slides-container > .carousel-slide")];
    if (!slides.length) slides = [...element.querySelectorAll(".carousel-slide")];
    const cells = [];
    slides.forEach((slide) => {
      const imageContainer = slide.querySelector(".image-container, .visual-container") || slide;
      const picture = imageContainer.querySelector("picture.desktop-image") || imageContainer.querySelector("picture") || imageContainer.querySelector('img:not([src^="data:"])');
      const contentCell = [];
      const headline = slide.querySelector(".content-cards-carousel-content-headline-container h1, .content-cards-carousel-content-headline-container h2") || slide.querySelector(".content-container h2");
      if (headline) contentCell.push(headline);
      const card = slide.querySelector(".content-card") || slide.querySelector(".carousel-content");
      if (card) {
        const cardHeading = card.querySelector(".card-headline-container h3, .card-headline-container h4") || card.querySelector("h3, h4");
        if (cardHeading) contentCell.push(cardHeading);
        const body = card.querySelector(".card-body-container");
        if (body) body.querySelectorAll("p").forEach((p) => contentCell.push(p));
        card.querySelectorAll(".card-button-container a[href], .button-container a[href]").forEach((a) => {
          if (contentCell.some((el) => el.contains(a))) return;
          const p = document2.createElement("p");
          p.append(a);
          contentCell.push(p);
        });
      }
      if (!picture && !contentCell.length) return;
      cells.push([picture || "", contentCell.length ? contentCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-condition", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function parse5(element, { document: document2 }) {
    const root = element.querySelector(":scope > .image-1-2") || (element.classList.contains("image-1-2") ? element : element.querySelector(".image-1-2")) || element;
    const own = (sel) => [...root.querySelectorAll(sel)].filter((el) => el.closest(".image-1-2") === root || root === element);
    const imageContainer = own(".image-container")[0];
    let picture = null;
    if (imageContainer) {
      picture = imageContainer.querySelector(".image-1-2-desktop-image picture, .desktop-image picture") || imageContainer.querySelector("picture") || imageContainer.querySelector("img");
    }
    const content = own(".content-container")[0];
    const textCell = [];
    if (content) {
      const heading = content.querySelector(".image-content-headline-container h1, .image-content-headline-container h2, .image-content-headline-container h3") || content.querySelector("h2, h3");
      if (heading) textCell.push(heading);
      content.querySelectorAll(".image-content-body-container p, .image-content-label-container p").forEach((p) => textCell.push(p));
      content.querySelectorAll(".button-group a[href], p.button-container a[href]").forEach((a) => {
        if (textCell.some((el) => el.contains(a))) return;
        const p = document2.createElement("p");
        p.append(a);
        textCell.push(p);
      });
    }
    if (!picture && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const imageCell = picture || "";
    const text = textCell.length ? textCell : "";
    const textFirst = root.classList.contains("desktop-right");
    const cells = [textFirst ? [text, imageCell] : [imageCell, text]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-banner.js
  function parse6(element, { document: document2 }) {
    const root = element.querySelector(".banner-1-2") || element;
    const picture = root.querySelector(".image-container.image-desktop picture") || root.querySelector(".image-container picture") || root.querySelector("picture") || root.querySelector('img:not([src^="data:"])');
    const content = root.querySelector(".content-wrapper") || root;
    const textCell = [];
    const heading = content.querySelector(".title-container h1, .title-container h2, .title-container h3") || content.querySelector("h2, h3");
    if (heading) textCell.push(heading);
    content.querySelectorAll(".content-container p").forEach((p) => {
      if (p.textContent.trim()) textCell.push(p);
    });
    content.querySelectorAll(".button-container a[href], a.button[href]").forEach((a) => {
      if (textCell.some((el) => el.contains(a))) return;
      const p = document2.createElement("p");
      p.append(a);
      textCell.push(p);
    });
    if (!picture && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell.length ? textCell : "", picture || ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/pfizerforall-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".core-overlay-host-wrapper"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.layout-header",
        "div.header.block",
        "footer.footer-wrapper",
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/pfizerforall-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "carousel-hero": parse,
    "columns-intro": parse2,
    "cards-action": parse3,
    "carousel-condition": parse4,
    "columns-media": parse5,
    "columns-banner": parse6
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Pfizer For All homepage: hero slideshow with brand intro, action cards, condition carousel, two media/text splits, and a Health Answers banner",
    urls: [
      "https://www.pfizerforall.com/"
    ],
    blocks: [
      { name: "carousel-hero", instances: [".hero.has-carousel .hero-image-and-info-container"] },
      { name: "columns-intro", instances: [".hero.has-carousel .hero-content"] },
      { name: "cards-action", instances: [".card-grid .cards-grid-container"] },
      { name: "carousel-condition", instances: [".content-cards-carousel.block"] },
      { name: "columns-media", instances: [".image-1-2-wrapper"] },
      { name: "columns-banner", instances: [".banner-1-2-wrapper"] }
    ],
    sections: [
      {
        id: "rc2",
        name: "hero",
        selector: [".section.hero-container"],
        style: null,
        blocks: ["carousel-hero", "columns-intro"],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "next-step-cards",
        selector: [".section.card-grid-container"],
        style: null,
        blocks: ["cards-action"],
        defaultContent: [".card-grid .card-grid-content-container"]
      },
      {
        id: "rc4",
        name: "condition-carousel",
        selector: [".section.content-cards-carousel-container"],
        style: null,
        blocks: ["carousel-condition"],
        defaultContent: []
      },
      {
        id: "rc5",
        name: "self-pay-savings",
        selector: [".section.image-1-2-container:nth-of-type(4)"],
        style: null,
        blocks: ["columns-media"],
        defaultContent: []
      },
      {
        id: "rc6",
        name: "prescription-savings",
        selector: [".section.image-1-2-container:nth-of-type(5)"],
        style: null,
        blocks: ["columns-media"],
        defaultContent: []
      },
      {
        id: "rc7",
        name: "health-answers-banner",
        selector: [".section.banner-1-2-container"],
        style: null,
        blocks: ["columns-banner"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
