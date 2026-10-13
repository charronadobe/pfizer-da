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

  // tools/importer/import-cancer-screening.js
  var import_cancer_screening_exports = {};
  __export(import_cancer_screening_exports, {
    default: () => import_cancer_screening_default
  });

  // tools/importer/parsers/hero-quiz.js
  var ORIGIN = "https://www.pfizerforall.com";
  var clean = (t) => (t || "").replace(/\s+/g, " ").trim();
  function iconImage(container, document2) {
    const span = container && container.querySelector("span.icon");
    const cls = span && [...span.classList].find((c) => c.startsWith("icon-"));
    if (!cls) return null;
    const name = cls.replace(/^icon-/, "").replace(/^asset-/, "");
    const img = document2.createElement("img");
    img.src = `${ORIGIN}/assets/icons/${name}.svg?format=svg`;
    img.alt = "";
    return img;
  }
  function ctaParagraph(a, wrapTag, document2) {
    if (!a) return null;
    const label = clean((a.querySelector(".span-button-text-variant") || a).textContent) || clean(a.getAttribute("title"));
    const href = a.getAttribute("href");
    if (!label || !href) return null;
    const link = document2.createElement("a");
    link.setAttribute("href", href);
    link.textContent = label;
    const wrap = document2.createElement(wrapTag);
    wrap.append(link);
    const p = document2.createElement("p");
    p.append(wrap);
    return p;
  }
  function parse(element, { document: document2 }) {
    const h1 = element.querySelector("h1, .oncology-quiz-card-title");
    const bottom = element.querySelector(".oncology-quiz-card-bottom-container") || element;
    const group = bottom.querySelector(".oncology-quiz-card-button-group");
    const timer = bottom.querySelector(".oncology-quiz-card-timer");
    let eyebrow = null;
    let heading = null;
    if (h1) {
      const copy = h1.cloneNode(true);
      const first = [...copy.childNodes].find((n) => n.nodeType !== 3 || clean(n.textContent));
      const emph = first && first.nodeType === 1 && /^(STRONG|B|U|EM|I)$/.test(first.tagName) ? first : null;
      if (emph && clean(emph.textContent)) {
        const strong = document2.createElement("strong");
        strong.textContent = clean(emph.textContent);
        eyebrow = document2.createElement("p");
        eyebrow.append(strong);
        emph.remove();
      }
      heading = document2.createElement("h1");
      heading.textContent = clean(copy.textContent);
      if (!heading.textContent) heading = null;
    }
    const subtitle = [...bottom.querySelectorAll("p")].filter((p) => !(group && group.contains(p)) && !(timer && timer.contains(p))).filter((p) => !p.querySelector("p") && clean(p.textContent)).map((p) => {
      const out = document2.createElement("p");
      out.innerHTML = p.innerHTML;
      return out;
    });
    const root = group || bottom;
    const primary = root.querySelector(".button-started-wrapper a[href]") || [...root.querySelectorAll("a[href]")].find((a) => !a.closest(".button-retake-wrapper, .button-return-wrapper"));
    const retake = root.querySelector(".button-retake-wrapper a[href]");
    const back = root.querySelector(".button-return-wrapper a[href]");
    let note = null;
    if (timer && clean(timer.textContent)) {
      note = document2.createElement("p");
      const icon = iconImage(timer, document2);
      if (icon) note.append(icon, document2.createTextNode(" "));
      note.append(document2.createTextNode(clean(timer.textContent)));
    }
    const main = [eyebrow, heading, ...subtitle, ctaParagraph(primary, "strong", document2), note].filter(Boolean);
    if (!heading && !main.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[main]];
    const returning = [ctaParagraph(retake, "strong", document2), ctaParagraph(back, "em", document2)].filter(Boolean);
    if (returning.length) cells.push([returning]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-quiz", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  var ORIGIN2 = "https://www.pfizerforall.com";
  var clean2 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function buildIcon(card, document2) {
    const wrap = card.querySelector(".icon-list-card-icon");
    if (!wrap) return null;
    const img = wrap.querySelector("img");
    const raw = img ? img.getAttribute("src") || "" : "";
    const out = document2.createElement("img");
    out.alt = "";
    if (raw && !raw.startsWith("data:")) {
      const abs = new URL(raw, ORIGIN2).href;
      out.src = /\.svg$/.test(abs) ? `${abs}?format=svg` : abs;
      out.alt = img.getAttribute("alt") || "";
      return out;
    }
    const span = wrap.querySelector("span.icon");
    const name = span && [...span.classList].find((c) => c.startsWith("icon-"));
    if (!name) return null;
    out.src = `${ORIGIN2}/assets/icons/${name.replace(/^icon-/, "").replace(/^asset-/, "")}.svg?format=svg`;
    return out;
  }
  function parse2(element, { document: document2 }) {
    const intro = [...element.querySelectorAll(".icon-list-content h2, .icon-list-content h3, .icon-list-content p")].filter((el) => clean2(el.textContent));
    let cards = [...element.querySelectorAll(".icon-list-container > .icon-list-card")];
    if (!cards.length) cards = [...element.querySelectorAll(".icon-list-card")];
    const cells = [];
    cards.forEach((card) => {
      const icon = buildIcon(card, document2);
      const copy = card.querySelector(".icon-list-card-copy") || card;
      const text = [];
      const heading = copy.querySelector("h2, h3, h4");
      if (heading) {
        const h3 = document2.createElement("h3");
        h3.textContent = clean2(heading.textContent);
        text.push(h3);
      }
      copy.querySelectorAll("p").forEach((p) => {
        if (clean2(p.textContent)) text.push(p);
      });
      if (!icon && !text.length) return;
      cells.push([icon || "", text.length ? text : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const variants = ["two-column", "one-column"].filter((v) => element.classList.contains(v));
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-icon", variants, cells });
    if (intro.length) element.before(...intro);
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-callout.js
  var ORIGIN3 = "https://www.pfizerforall.com";
  var LOGO_ALT = { "acs-logo": "American Cancer Society" };
  var clean3 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function buildLogo(wrap, document2) {
    if (!wrap) return null;
    const picture = wrap.querySelector("picture");
    if (picture) return picture;
    const img = wrap.querySelector("img");
    const rawSrc = img ? img.getAttribute("src") || "" : "";
    if (rawSrc && !rawSrc.startsWith("data:")) {
      const out2 = document2.createElement("img");
      const abs = new URL(rawSrc, ORIGIN3).href;
      out2.src = /\.svg$/.test(abs) ? `${abs}?format=svg` : abs;
      out2.alt = img.getAttribute("alt") || "";
      return out2;
    }
    const spans = [...wrap.querySelectorAll("span.icon")];
    const span = spans.find((s) => !s.classList.contains("relief-theme") && ![...s.classList].some((c) => /^icon-.*-relief$/.test(c))) || spans[0];
    const cls = span && [...span.classList].find((c) => c.startsWith("icon-"));
    if (!cls) return null;
    const name = cls.replace(/^icon-/, "").replace(/^asset-/, "");
    const out = document2.createElement("img");
    out.src = `${ORIGIN3}/assets/icons/${name}.svg?format=svg`;
    out.alt = LOGO_ALT[name] || "";
    return out;
  }
  function parse3(element, { document: document2 }) {
    const logo = buildLogo(element.querySelector(".content-card-logo"), document2);
    const text = [];
    const heading = element.querySelector(".content-card-title h2, .content-card-title h3") || element.querySelector("h2, h3");
    if (heading) text.push(heading);
    const body = element.querySelector(".content-card-body");
    (body ? [...body.querySelectorAll("p")] : [...element.querySelectorAll("p")]).filter((p) => clean3(p.textContent)).forEach((p) => text.push(p));
    if (!logo && !text.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[logo || "", text.length ? text : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-callout", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-carousel.js
  var ORIGIN4 = "https://www.pfizerforall.com";
  function absUrl(src) {
    try {
      return new URL(src, ORIGIN4).href;
    } catch (e) {
      return src;
    }
  }
  function buildIcon2(card, document2) {
    const wrap = card.querySelector(".card-icon, .card-image");
    if (!wrap) return null;
    const img = wrap.querySelector("img");
    const raw = img ? img.getAttribute("src") || "" : "";
    if (raw && !raw.startsWith("data:")) {
      const out2 = document2.createElement("img");
      out2.src = absUrl(raw.endsWith(".svg") ? `${raw}?format=svg` : raw);
      out2.alt = img.getAttribute("alt") || "";
      return out2;
    }
    const span = wrap.querySelector("span.icon");
    const name = span && [...span.classList].find((c) => c.startsWith("icon-"));
    if (!name) return null;
    const out = document2.createElement("img");
    out.src = `${ORIGIN4}/assets/icons/${name.replace(/^icon-/, "")}.svg?format=svg`;
    out.alt = "";
    return out;
  }
  function unwrapStrong(heading) {
    heading.querySelectorAll("strong, b").forEach((s) => s.replaceWith(...s.childNodes));
    return heading;
  }
  function parse4(element, { document: document2 }) {
    const intro = [];
    const introRoot = element.querySelector(".cards-carousel-content-section");
    if (introRoot) {
      introRoot.querySelectorAll(".cards-carousel-content-eyebrow-container p, .cards-carousel-content-headline-container h2, .cards-carousel-content-headline-container h3, .cards-carousel-content-body-container p").forEach((el) => intro.push(el));
    }
    let cards = [...element.querySelectorAll("ul.cards-list > li.card")];
    if (!cards.length) cards = [...element.querySelectorAll(".card")].filter((c) => !c.closest(".cards-carousel-content-section"));
    const cells = [];
    cards.forEach((card) => {
      const icon = buildIcon2(card, document2);
      const content = card.querySelector(".card-content") || card;
      const text = [];
      const heading = content.querySelector(".card-headline-container h2, .card-headline-container h3, .card-headline-container h4") || content.querySelector("h2, h3, h4");
      if (heading) text.push(unwrapStrong(heading));
      content.querySelectorAll(".card-body-container p").forEach((p) => text.push(p));
      content.querySelectorAll(".button-container a[href]").forEach((a) => {
        const p = document2.createElement("p");
        p.append(a);
        text.push(p);
      });
      if (!icon && !text.length) return;
      cells.push([icon || "", text.length ? text : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-carousel", cells });
    if (intro.length) element.before(...intro);
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  var clean4 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function parse5(element, { document: document2 }) {
    const intro = [...element.querySelectorAll(".accordion-basic-content-section h2, .accordion-basic-content-section h3, .accordion-basic-content-section p, .accordion-content-section h2, .accordion-content-section h3, .accordion-content-section p")].filter((el) => clean4(el.textContent));
    let items = [...element.querySelectorAll(".accordion-basic-accordion-stack > details, .accordion-card-stack > details")];
    if (!items.length) items = [...element.querySelectorAll("details")];
    const cells = [];
    items.forEach((item) => {
      const labelEl = item.querySelector("summary .accordion-basic-card__label, summary .accordion-title-label") || item.querySelector("summary");
      const question = clean4(labelEl ? labelEl.textContent : "");
      if (!question) return;
      const content = item.querySelector(".accordion-basic-card__expanded-content, .accordion-expanded-content") || item;
      const answer = [];
      content.querySelectorAll(".accordion-basic-card__body-container, .accordion-card-body-container").forEach((body) => {
        [...body.children].forEach((el) => {
          if (clean4(el.textContent) || el.querySelector("img, picture")) answer.push(el);
        });
      });
      content.querySelectorAll(".accordion-basic-card-button-group a[href]").forEach((a) => {
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = clean4(a.textContent);
        const p = document2.createElement("p");
        p.append(link);
        answer.push(p);
      });
      content.querySelectorAll(".accordion-basic-card__label-container p").forEach((p) => {
        if (clean4(p.textContent)) answer.push(p);
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

  // tools/importer/import-cancer-screening.js
  var parsers = {
    "hero-quiz": parse,
    "cards-icon": parse2,
    "columns-callout": parse3,
    "cards-carousel": parse4,
    "accordion-faq": parse5
  };
  var PAGE_TEMPLATE = {
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
  var import_cancer_screening_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const arm = [...document2.body.classList].find((c) => c.startsWith("variant-"));
      if (arm && arm !== "variant-control") {
        throw new Error(`Experiment arm "${arm}" captured instead of control for ${params.originalURL}; re-run the import`);
      }
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
          blocks: pageBlocks.map((b) => b.name),
          fragments: (params.fragments || []).map((f) => f.path).join(", ")
        }
      }];
    }
  };
  return __toCommonJS(import_cancer_screening_exports);
})();
