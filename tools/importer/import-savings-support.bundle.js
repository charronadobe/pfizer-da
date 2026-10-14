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

  // tools/importer/import-savings-support.js
  var import_savings_support_exports = {};
  __export(import_savings_support_exports, {
    default: () => import_savings_support_default
  });

  // tools/importer/parsers/hero-page.js
  var ORIGIN = "https://www.pfizerforall.com";
  function absUrl(src) {
    if (!src) return "";
    try {
      return new URL(src, ORIGIN).href;
    } catch (e) {
      return src;
    }
  }
  function desktopImage(picture, document2) {
    if (!picture) return null;
    const img = picture.querySelector("img");
    const sources = [...picture.querySelectorAll("source")];
    const desktop = sources.find((s) => /min-width:\s*1024px/.test(s.getAttribute("media") || "") && !/webp/.test(s.getAttribute("type") || ""));
    let src = desktop ? (desktop.getAttribute("srcset") || "").trim().split(/\s+/)[0] : "";
    if (!src && img) src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) return null;
    const out = document2.createElement("img");
    out.src = absUrl(src);
    out.alt = img && img.getAttribute("alt") || "";
    return out;
  }
  function parse(element, { document: document2 }) {
    const picture = element.querySelector(".hero-image-container picture") || element.querySelector("picture");
    const image = desktopImage(picture, document2);
    const heading = element.querySelector(".hero-headline-container h1, .hero-headline-container h2") || element.querySelector("h1");
    const body = [...element.querySelectorAll(".hero-body-container p")];
    const label = [...element.querySelectorAll(".hero-label-container p")];
    if (!heading && !body.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const variants = [];
    const bannerLink = element.querySelector(".informational-banner a[href]");
    let announcement = null;
    if (bannerLink && bannerLink.textContent.trim()) {
      const link = document2.createElement("a");
      link.href = bannerLink.getAttribute("href");
      const title = bannerLink.getAttribute("title");
      if (title) link.title = title;
      link.textContent = bannerLink.textContent.replace(/\s+/g, " ").trim();
      announcement = document2.createElement("p");
      announcement.append(link);
      variants.push("announcement");
    }
    const content = [];
    if (image) content.push(image);
    if (announcement) content.push(announcement);
    if (heading) content.push(heading);
    content.push(...body, ...label);
    const cells = [[content]];
    const dropdown = element.querySelector(".hero-dropdown-container .element-dropdown") || element.querySelector(".element-dropdown");
    const options = dropdown ? [...dropdown.querySelectorAll(".dropdown-menu a[href]")] : [];
    if (options.length) {
      variants.push("dropdown");
      const selectorCell = [];
      const labelEl = dropdown.querySelector(".dropdown-label");
      if (labelEl && labelEl.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = labelEl.textContent.trim();
        selectorCell.push(p);
      }
      const ul = document2.createElement("ul");
      const placeholder = dropdown.querySelector(".dropdown-placeholder");
      const prompt = placeholder ? placeholder.textContent.trim() : "";
      if (prompt) {
        const li = document2.createElement("li");
        li.textContent = prompt;
        ul.append(li);
      }
      options.forEach((a) => {
        const li = document2.createElement("li");
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = a.textContent.replace(/\s+/g, " ").trim();
        li.append(link);
        ul.append(li);
      });
      selectorCell.push(ul);
      cells.push([selectorCell]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-page", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-fact.js
  var clean = (t) => (t || "").replace(/\s+/g, " ").trim();
  function heading3(el, document2) {
    const h3 = document2.createElement("h3");
    h3.textContent = clean(el.textContent);
    return h3;
  }
  function parse2(element, { document: document2 }) {
    const intro = [...element.querySelectorAll(".vertical-card-content-section h2, .vertical-card-content-section h3, .vertical-card-content-section p")].filter((el) => clean(el.textContent));
    let items = [...element.querySelectorAll(".vertical-card-stacked > .vertical-card-item")];
    if (!items.length) items = [...element.querySelectorAll(".vertical-card-item")];
    const cells = [];
    items.forEach((item) => {
      const cell = [];
      const topic = item.querySelector(".vertical-card-topic h1, .vertical-card-topic h2, .vertical-card-topic h3, .vertical-card-topic h4, .vertical-card-topic p");
      if (topic && clean(topic.textContent)) cell.push(heading3(topic, document2));
      const statement = item.querySelector(".vertical-card-heading h1, .vertical-card-heading h2, .vertical-card-heading h3, .vertical-card-heading h4, .vertical-card-heading p");
      if (statement && clean(statement.textContent)) cell.push(heading3(statement, document2));
      const cta = item.querySelector(".vertical-card-button-group a.button[href], a.button.text[href]");
      item.querySelectorAll(".vertical-card-body p, .vertical-card-body ul, .vertical-card-body ol").forEach((el) => {
        if (el.closest(".vertical-card-button-group") || cta && el.contains(cta)) return;
        if (clean(el.textContent)) cell.push(el);
      });
      if (cta && clean(cta.textContent)) {
        const link = document2.createElement("a");
        link.href = cta.getAttribute("href");
        const title = cta.getAttribute("title");
        if (title) link.title = title;
        link.textContent = clean(cta.textContent);
        const p = document2.createElement("p");
        p.append(link);
        cell.push(p);
      }
      if (cell.length) cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-fact", cells });
    if (intro.length) element.before(...intro);
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  var ROOT_SEL = ".image-1-2, .image-1-1, .base-image-block";
  function pageUrl(params) {
    if (params && params.originalURL) return params.originalURL;
    try {
      return window.location.href;
    } catch (e) {
      return "";
    }
  }
  var plainDoc;
  function loadPlain(params) {
    if (plainDoc !== void 0) return plainDoc;
    plainDoc = null;
    const bases = [];
    try {
      if (/^https?:/.test(window.location.href)) bases.push(window.location.href);
    } catch (e) {
    }
    if (params && params.originalURL) bases.push(params.originalURL);
    const tried = /* @__PURE__ */ new Set();
    for (const base of bases) {
      let u;
      try {
        u = new URL(base);
      } catch (e) {
        continue;
      }
      const p = u.pathname.replace(/\.html?$/, "");
      const candidates = p.endsWith("/") ? [`${p}index.plain.html`] : [`${p}.plain.html`, `${p}/index.plain.html`];
      for (const c of candidates) {
        const href = `${u.origin}${c}`;
        if (tried.has(href)) continue;
        tried.add(href);
        try {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", href, false);
          xhr.send();
          if (xhr.status === 200 && /<div/.test(xhr.responseText)) {
            plainDoc = new DOMParser().parseFromString(xhr.responseText, "text/html");
            return plainDoc;
          }
        } catch (e) {
        }
      }
    }
    return plainDoc;
  }
  var norm = (t) => (t || "").replace(/\s+/g, " ").trim().toLowerCase();
  function plainImage(root, alt, params) {
    const plain = loadPlain(params);
    if (!plain) return null;
    if (alt) {
      const byAlt = [...plain.querySelectorAll("img")].find((i) => (i.getAttribute("alt") || "") === alt);
      if (byAlt) return byAlt;
    }
    const type = ["image-1-1", "image-1-2"].find((c) => root.classList.contains(c));
    const heading = root.querySelector("h1, h2, h3");
    if (!type || !heading) return null;
    const h = norm(heading.textContent);
    const block = [...plain.querySelectorAll(`div.${type}`)].find((b) => h && norm(b.textContent).includes(h));
    if (!block) return null;
    const row = [...block.children].find((r) => norm((r.children[0] || {}).textContent) === "image");
    return (row || block).querySelector("img");
  }
  function fixImage(picture, document2, params, root) {
    let img = picture.tagName === "IMG" ? picture : picture.querySelector("img");
    const base = pageUrl(params);
    let src = img ? img.getAttribute("src") || "" : "";
    if (!img || !src || src.startsWith("data:")) {
      const match = plainImage(root, img ? img.getAttribute("alt") || "" : "", params);
      src = match ? match.getAttribute("src") : "";
      if (!src) return null;
      if (/\.gif(\?|$)/i.test(src)) src = src.replace(/\?.*$/, "");
      const fresh = document2.createElement("img");
      fresh.setAttribute("src", src);
      fresh.setAttribute("alt", img && img.getAttribute("alt") || match.getAttribute("alt") || "");
      img = fresh;
      picture = fresh;
    }
    if (base && !/^https?:/.test(src)) {
      try {
        src = new URL(src, base).href;
      } catch (e) {
      }
    }
    if (src !== img.getAttribute("src")) img.setAttribute("src", src);
    return picture;
  }
  function parse3(element, { document: document2, params }) {
    const root = element.querySelector(`:scope > ${ROOT_SEL.split(", ").join(", :scope > ")}`) || (element.matches(ROOT_SEL) ? element : element.querySelector(ROOT_SEL)) || element;
    const own = (sel) => [...root.querySelectorAll(sel)].filter((el) => el.closest(ROOT_SEL) === root || root === element);
    const imageContainer = own(".image-container")[0];
    let picture = null;
    if (imageContainer) {
      const candidates = [...imageContainer.querySelectorAll(".image-1-2-desktop-image picture, .image-1-1-desktop-image picture, .desktop-image picture")].concat([...imageContainer.querySelectorAll("picture")], [...imageContainer.querySelectorAll("img")]).filter((el) => !el.closest(".image-relief"));
      picture = candidates[0] || null;
      if (picture) picture = fixImage(picture, document2, params, root);
    }
    const content = own(".content-container")[0];
    const textCell = [];
    if (content) {
      content.querySelectorAll(".image-content-eyebrow-container p").forEach((p) => {
        if (p.textContent.trim()) textCell.push(p);
      });
      const heading = content.querySelector(".image-content-headline-container h1, .image-content-headline-container h2, .image-content-headline-container h3") || content.querySelector("h2, h3");
      if (heading) textCell.push(heading);
      content.querySelectorAll(".image-content-body-container p, .image-content-label-container p").forEach((p) => textCell.push(p));
      content.querySelectorAll(".button-group a[href], p.button-container a[href]").forEach((a) => {
        if (textCell.some((el) => el.contains(a))) return;
        const p = document2.createElement("p");
        if (a.classList.contains("secondary")) {
          const em = document2.createElement("em");
          em.append(a);
          p.append(em);
        } else if (a.classList.contains("text")) {
          const strong = document2.createElement("strong");
          const em = document2.createElement("em");
          em.append(a);
          strong.append(em);
          p.append(strong);
        } else {
          p.append(a);
        }
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
    const variants = [];
    if (root.classList.contains("image-1-1")) variants.push("full-bleed");
    if (root.classList.contains("italic-text")) variants.push("italic");
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-media", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  var clean2 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function parse4(element, { document: document2 }) {
    const intro = [...element.querySelectorAll(".accordion-basic-content-section h2, .accordion-basic-content-section h3, .accordion-basic-content-section p, .accordion-content-section h2, .accordion-content-section h3, .accordion-content-section p")].filter((el) => clean2(el.textContent));
    let items = [...element.querySelectorAll(".accordion-basic-accordion-stack > details, .accordion-card-stack > details")];
    if (!items.length) items = [...element.querySelectorAll("details")];
    const cells = [];
    items.forEach((item) => {
      const labelEl = item.querySelector("summary .accordion-basic-card__label, summary .accordion-title-label") || item.querySelector("summary");
      const question = clean2(labelEl ? labelEl.textContent : "");
      if (!question) return;
      const content = item.querySelector(".accordion-basic-card__expanded-content, .accordion-expanded-content") || item;
      const answer = [];
      content.querySelectorAll(".accordion-basic-card__body-container, .accordion-card-body-container").forEach((body) => {
        [...body.children].forEach((el) => {
          if (clean2(el.textContent) || el.querySelector("img, picture")) answer.push(el);
        });
      });
      content.querySelectorAll(".accordion-basic-card-button-group a[href]").forEach((a) => {
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = clean2(a.textContent);
        const p = document2.createElement("p");
        p.append(link);
        answer.push(p);
      });
      content.querySelectorAll(".accordion-basic-card__label-container p").forEach((p) => {
        if (clean2(p.textContent)) answer.push(p);
      });
      const q = document2.createElement("p");
      q.textContent = question;
      cells.push([q, answer.length ? answer : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const isCard = element.classList.contains("accordion-card-1-1") || !!element.closest(".accordion-card-1-1") || !!element.querySelector(":scope > .accordion-card-1-1");
    const variants = isCard ? ["card"] : [];
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", variants, cells });
    if (intro.length) element.before(...intro);
    element.replaceWith(block);
  }

  // tools/importer/parsers/search-prompt.js
  var RESULTS_PATH = "/search-result";
  var clean3 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function parse5(element, { document: document2 }) {
    const labelEl = element.querySelector(".search-block-text-2-1-input label, label.input-label");
    const input = element.querySelector('input.input-field, input[type="text"], input[type="search"]');
    const placeholder = clean3(labelEl ? labelEl.textContent : "") || clean3(input && input.getAttribute("placeholder"));
    const button = element.querySelector('.search-block-text-2-1-button button, button[type="submit"]');
    const buttonLabel = clean3(button ? (button.querySelector(".button__label") || button).textContent : "");
    if (!placeholder && !buttonLabel) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const content = [];
    if (placeholder) {
      const p2 = document2.createElement("p");
      p2.textContent = placeholder;
      content.push(p2);
    }
    const form = element.closest("form") || element.querySelector("form");
    const action = form && form.getAttribute("action");
    const a = document2.createElement("a");
    a.href = action || RESULTS_PATH;
    a.textContent = buttonLabel || placeholder;
    const p = document2.createElement("p");
    p.append(a);
    content.push(p);
    const cells = [[content]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "search-prompt", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/pfizerforall-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var YT_ID_PATTERNS = [
    /youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/,
    /youtube\.com\/watch\?(?:[^#]*&)?v=([\w-]{6,})/,
    /youtu\.be\/([\w-]{6,})/
  ];
  function findYouTubeId(el) {
    const nodes = [el, ...el.querySelectorAll("*")];
    for (const node of nodes) {
      for (const attr of [...node.attributes]) {
        if (/^(data-)?(video-?)?id$/i.test(attr.name) && /^[\w-]{11}$/.test(attr.value) && node.closest('.video-element-youtube, [class*="youtube"]')) {
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
  function getLivePageUrl(payload) {
    const candidates = [payload && payload.params && payload.params.originalURL, payload && payload.url];
    for (const c of candidates) {
      if (!c) continue;
      try {
        const u = new URL(c);
        if (!/^https?:$/.test(u.protocol)) continue;
        u.search = "";
        u.hash = "";
        return u.href;
      } catch (e) {
      }
    }
    return null;
  }
  function getPagePath(payload) {
    const candidates = [payload && payload.params && payload.params.originalURL, payload && payload.url];
    for (const c of candidates) {
      if (!c) continue;
      try {
        return new URL(c).pathname.replace(/\/+$/, "");
      } catch (e) {
      }
    }
    try {
      const loc = document.location;
      if (loc && /^https?:$/.test(loc.protocol)) return loc.pathname.replace(/\/+$/, "");
    } catch (e) {
    }
    return null;
  }
  function clonePopupContent(doc, popup) {
    const source = popup.querySelector(".popup-modal-body") || popup.querySelector(".popup-modal-content") || popup;
    const out = doc.createElement("div");
    const CONTENT = "h1, h2, h3, h4, h5, h6, p, ul, ol, picture, img";
    [...source.querySelectorAll(CONTENT)].filter((el) => !el.closest(".popup-modal-close") && !el.parentElement.closest(CONTENT)).forEach((el) => out.append(el.cloneNode(true)));
    out.querySelectorAll("button, .icon, svg").forEach((el) => el.remove());
    out.querySelectorAll("a span").forEach((span) => span.replaceWith(...span.childNodes));
    out.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (/^(data-|style$|class$|id$)/.test(attr.name)) el.removeAttribute(attr.name);
      });
    });
    return out;
  }
  function createLinkParagraph(doc, href, text) {
    const p = doc.createElement("p");
    const a = doc.createElement("a");
    a.href = href;
    a.textContent = text;
    p.append(a);
    return p;
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".core-overlay-host-wrapper"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".hero-inner-container > nav.breadcrumb",
        ".hero-sticky-dropdown-clone",
        ".image-container > .image-relief"
      ]);
      element.querySelectorAll("#main > div.section").forEach((section) => {
        if (section.className.trim() === "section" && !section.children.length && !section.textContent.trim()) {
          section.remove();
        }
      });
      const doc = element.ownerDocument || document;
      element.querySelectorAll(".video-1-1.block").forEach((block) => {
        const id = findYouTubeId(block);
        if (!id) return;
        const url = `https://www.youtube.com/watch?v=${id}`;
        block.replaceWith(createLinkParagraph(doc, url, url));
      });
      const rxBlocks = [...element.querySelectorAll(".rx-search-results.block")];
      if (rxBlocks.length) {
        const toolUrl = getLivePageUrl(payload);
        if (!toolUrl) console.warn("pfizerforall-cleanup: no source URL, Rx search link omitted");
        const rxIds = /* @__PURE__ */ new Set();
        rxBlocks.forEach((block) => {
          [block, block.closest(".rx-search-results-wrapper"), block.closest("#main > div.section")].forEach((el) => {
            if (el && el.id) rxIds.add(el.id);
          });
        });
        rxBlocks.forEach((block) => {
          const action = block.querySelector(".rx-search-action-section");
          const labelEl = block.querySelector(".type-ahead__label");
          const input = block.querySelector("input.type-ahead__field");
          const label = labelEl && labelEl.textContent.trim() || input && (input.getAttribute("aria-label") || input.getAttribute("placeholder") || "").trim() || "";
          const typeStack = block.querySelector(".rx-search-content-type-stack");
          if (toolUrl && label && (typeStack || action)) {
            const p = createLinkParagraph(doc, toolUrl, label);
            if (typeStack) typeStack.append(p);
            else action.before(p);
          }
          block.querySelectorAll(".rx-search-action-section, .rx-search-cards-container").forEach((el) => el.remove());
        });
        if (toolUrl && rxIds.size) {
          element.querySelectorAll('a[href*="#"]').forEach((a) => {
            let hash;
            try {
              hash = decodeURIComponent(new URL(a.getAttribute("href"), toolUrl).hash.slice(1));
            } catch (e) {
              return;
            }
            if (rxIds.has(hash)) a.setAttribute("href", toolUrl);
          });
        }
      }
      element.querySelectorAll("#main > div.section.icon-list-container").forEach((section) => {
        if (section.querySelector(".icon-list.copay")) section.remove();
      });
      const popups = [...element.querySelectorAll(".popup-modal.block[id]")];
      if (popups.length) {
        let pagePath = getPagePath(payload);
        if (pagePath === null) {
          console.warn("pfizerforall-cleanup: no source URL, popup fragments use /fragments/<id>");
          pagePath = "";
        }
        const ids = new Set(popups.map((p) => p.id));
        const base = payload.params && payload.params.originalURL || payload.url;
        element.querySelectorAll('a[href*="#"]').forEach((a) => {
          if (a.closest(".popup-modal")) return;
          let hash;
          try {
            hash = decodeURIComponent(new URL(a.getAttribute("href"), base).hash.slice(1));
          } catch (e) {
            return;
          }
          if (ids.has(hash)) a.setAttribute("href", `/fragments${pagePath}/${hash}#_dnb`);
        });
        if (!payload.params) payload.params = {};
        const fragments = payload.params.fragments || (payload.params.fragments = []);
        popups.forEach((popup) => {
          fragments.push({
            path: `/fragments${pagePath}/${popup.id}`,
            element: clonePopupContent(doc, popup)
          });
        });
        popups.forEach((popup) => {
          const host = popup.closest("#main > div.section.popup-modal-container") || popup.closest(".popup-modal-wrapper") || popup;
          host.remove();
        });
      }
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
  var STYLE_ATTR = "data-excat-section-style";
  var FIRST_ATTR = "data-excat-section-first";
  function splitHas(sel) {
    const filters = [];
    let base = "";
    let i = 0;
    while (i < sel.length) {
      const rest = sel.slice(i);
      const m = rest.match(/^:not\(\s*:has\(/) || rest.match(/^:has\(/);
      if (m) {
        const negate = m[0].startsWith(":not");
        let depth = 1;
        let j = i + m[0].length;
        const start = j;
        while (j < sel.length && depth > 0) {
          if (sel[j] === "(") depth += 1;
          else if (sel[j] === ")") depth -= 1;
          j += 1;
        }
        const inner = sel.slice(start, j - 1).trim();
        if (negate) {
          while (j < sel.length && sel[j] !== ")") j += 1;
          j += 1;
        }
        filters.push({ inner, negate, at: base.length });
        i = j;
      } else {
        base += sel[i];
        i += 1;
      }
    }
    return { base: base.trim(), filters };
  }
  function supportsHas(root) {
    try {
      root.querySelector(":has(*)");
      return true;
    } catch (e) {
      return false;
    }
  }
  function queryAll(root, sel, hasSupport) {
    if (!sel) return [];
    if (hasSupport || sel.indexOf(":has(") === -1) {
      try {
        return [...root.querySelectorAll(sel)];
      } catch (e) {
        if (sel.indexOf(":has(") === -1) return [];
      }
    }
    const { base, filters } = splitHas(sel);
    let els;
    try {
      els = [...root.querySelectorAll(base)];
    } catch (e) {
      return [];
    }
    return els.filter((el) => filters.every(({ inner, negate }) => {
      let found = false;
      try {
        found = !!el.querySelector(inner);
      } catch (e) {
        found = false;
      }
      return negate ? !found : found;
    }));
  }
  function collectSections(root, sections) {
    const hasSupport = supportsHas(root);
    const owner = /* @__PURE__ */ new Map();
    sections.forEach((section) => {
      const list = Array.isArray(section.selector) ? section.selector : [section.selector];
      list.forEach((sel) => {
        queryAll(root, sel, hasSupport).forEach((el) => {
          if (!owner.has(el)) owner.set(el, section);
        });
      });
    });
    const matched = [...owner.entries()].map(([el, section]) => ({ el, section }));
    matched.sort((a, b) => {
      if (a.el === b.el) return 0;
      return a.el.compareDocumentPosition(b.el) & 4 ? -1 : 1;
    });
    return matched.filter(({ el }) => !matched.some((o) => o.el !== el && o.el.contains(el)));
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      const matched = collectSections(element, sections);
      for (let i = matched.length - 1; i >= 0; i -= 1) {
        const { el, section } = matched[i];
        if (i === 0 && !section.style) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(STYLE_ATTR, section.style);
        if (i === 0) hr.setAttribute(FIRST_ATTR, "true");
        el.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      const markers = [...element.querySelectorAll(`hr[${STYLE_ATTR}]`)];
      for (let i = markers.length - 1; i >= 0; i -= 1) {
        const marker = markers[i];
        const style = marker.getAttribute(STYLE_ATTR);
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style }
        });
        marker.after(metadataBlock);
        marker.removeAttribute(STYLE_ATTR);
        if (marker.hasAttribute(FIRST_ATTR)) marker.remove();
      }
    }
  }

  // tools/importer/import-savings-support.js
  var parsers = {
    "hero-page": parse,
    "cards-fact": parse2,
    "columns-media": parse3,
    "accordion-faq": parse4,
    "search-prompt": parse5
  };
  var PAGE_TEMPLATE = {
    name: "savings-support",
    description: "Financial assistance landing page",
    urls: [
      "https://www.pfizerforall.com/savings-support/prescription-assistance"
    ],
    blocks: [
      {
        name: "hero-page",
        instances: [
          "#main > div.section.hero-container .hero.block"
        ]
      },
      {
        name: "cards-fact",
        instances: [
          "#main > div.section.vertical-card-container .vertical-card.block"
        ]
      },
      {
        name: "columns-media",
        instances: [
          "#main > div.section.image-1-2-container .image-1-2.block"
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
      }
    ],
    sections: [
      {
        id: "sv-hero",
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
        id: "sv-rx-search",
        name: "rx savings search",
        selector: [
          "#main > div.section.rx-search-results-container"
        ],
        style: "blue",
        blocks: [],
        defaultContent: [
          ".rx-search-results"
        ]
      },
      {
        id: "sv-options",
        name: "find the right option",
        selector: [
          "#main > div.section.vertical-card-container"
        ],
        style: null,
        blocks: [
          "cards-fact"
        ],
        defaultContent: [
          ".vertical-card-content-container"
        ]
      },
      {
        id: "sv-prior-auth",
        name: "prior authorization",
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
        id: "sv-faq",
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
        id: "sv-search",
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
  var import_savings_support_default = {
    transform: (payload) => {
      var _a;
      const { document: document2, url, params } = payload;
      const arm = [...document2.body.classList].find((c) => c.startsWith("variant-"));
      if (arm && arm !== "variant-control") {
        throw new Error(`Experiment arm "${arm}" captured instead of control for ${params.originalURL}; re-run the import`);
      }
      const main = document2.body;
      const sourceCrumb = document2.querySelector("#main nav.breadcrumb");
      const crumbLabel = ((_a = sourceCrumb == null ? void 0 : sourceCrumb.querySelector('[aria-current="page"], .breadcrumb__current')) == null ? void 0 : _a.textContent.trim()) || "";
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
      const metadataTable = [...main.querySelectorAll("table")].reverse().find((t) => {
        var _a2;
        return ((_a2 = t.rows[0]) == null ? void 0 : _a2.textContent.trim().toLowerCase()) === "metadata";
      });
      if (metadataTable && (!sourceCrumb || crumbLabel)) {
        const row = metadataTable.insertRow();
        row.insertCell().textContent = sourceCrumb ? "Breadcrumb-Title" : "Breadcrumb";
        row.insertCell().textContent = sourceCrumb ? crumbLabel : "off";
      }
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
  return __toCommonJS(import_savings_support_exports);
})();
