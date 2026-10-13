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

  // tools/importer/import-education.js
  var import_education_exports = {};
  __export(import_education_exports, {
    default: () => import_education_default
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

  // tools/importer/parsers/carousel-condition.js
  var ARTICLE_INDEX = "/education/article-index.json";
  var plainCache;
  function loadPlain(params) {
    if (plainCache !== void 0) return plainCache;
    plainCache = null;
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
            plainCache = new DOMParser().parseFromString(xhr.responseText, "text/html");
            return plainCache;
          }
        } catch (e) {
        }
      }
    }
    return plainCache;
  }
  var clean = (t) => (t || "").replace(/\s+/g, " ").trim();
  function parseArticles(element, document2, params) {
    const cells = [["source", ARTICLE_INDEX]];
    const top = [...element.classList].map((c) => c.match(/^top-(\d+)$/)).find(Boolean);
    let limit = top ? top[1] : "";
    let paths = [];
    const plain = loadPlain(params);
    if (plain) {
      const blocks = [...plain.querySelectorAll("div.content-cards-carousel.dynamic-article")];
      const live = [...element.ownerDocument.querySelectorAll(".content-cards-carousel.block.dynamic-article")];
      const authored = blocks[Math.max(live.indexOf(element), 0)] || blocks[0];
      if (authored) {
        if (!limit) {
          const t = [...authored.classList].map((c) => c.match(/^top-(\d+)$/)).find(Boolean);
          if (t) limit = t[1];
        }
        [...authored.children].forEach((row) => {
          const [k, v] = [...row.children];
          if (!k || !v) return;
          const key = clean(k.textContent).toLowerCase();
          if (key === "article-urls" || key === "paths") {
            const items = [...v.querySelectorAll("li")].map((li) => clean(li.textContent));
            paths = items.length ? items : clean(v.textContent).split(/[\s,]+/).filter(Boolean);
          }
        });
      }
    }
    if (limit) cells.push(["limit", limit]);
    if (paths.length) {
      const ul = document2.createElement("ul");
      paths.forEach((p) => {
        const li = document2.createElement("li");
        li.textContent = p;
        ul.append(li);
      });
      cells.push(["paths", ul]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-condition", variants: ["articles"], cells });
    element.replaceWith(block);
  }
  function parse2(element, { document: document2, params }) {
    if (element.classList.contains("dynamic-article")) {
      parseArticles(element, document2, params);
      return;
    }
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

  // tools/importer/parsers/cards-feed.js
  var ORIGIN2 = "https://www.pfizerforall.com";
  var ARTICLE_INDEX2 = "/education/article-index.json";
  var plainCache2;
  function loadPlain2(params) {
    if (plainCache2 !== void 0) return plainCache2;
    plainCache2 = null;
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
            plainCache2 = new DOMParser().parseFromString(xhr.responseText, "text/html");
            return plainCache2;
          }
        } catch (e) {
        }
      }
    }
    return plainCache2;
  }
  var clean2 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function readRows(blockEl) {
    return [...blockEl.children].map((row) => {
      const [k, v] = [...row.children];
      return k && v ? { key: clean2(k.textContent).toLowerCase(), value: v } : null;
    }).filter(Boolean);
  }
  function authoredRows(element, params) {
    const plain = loadPlain2(params);
    if (!plain) return null;
    const blocks = [...plain.querySelectorAll("div.card-grid.dynamic-article")];
    if (!blocks.length) return null;
    const live = [...element.ownerDocument.querySelectorAll(".card-grid.block.dynamic-article")];
    const idx = Math.max(live.indexOf(element), 0);
    return readRows(blocks[idx] || blocks[0]);
  }
  function iconImg(name, document2) {
    const img = document2.createElement("img");
    img.src = `${ORIGIN2}/assets/icons/${name.replace(/^icon-/, "").replace(/^asset-/, "")}.svg?format=svg`;
    img.alt = "";
    return img;
  }
  function iconName(el) {
    const cls = el && [...el.classList].find((c) => c.startsWith("icon-"));
    return cls ? cls.slice(5) : "";
  }
  function list(values, document2) {
    const ul = document2.createElement("ul");
    values.forEach((v) => {
      const li = document2.createElement("li");
      li.textContent = v;
      ul.append(li);
    });
    return ul;
  }
  function importPromo(cell, document2) {
    const out = [];
    [...cell.children].forEach((el) => {
      const node = document2.importNode(el, true);
      node.querySelectorAll("span.icon").forEach((span) => {
        const name = iconName(span);
        if (name) span.replaceWith(iconImg(name, document2));
        else span.remove();
      });
      if (/^H[1-6]$/.test(node.tagName)) {
        node.removeAttribute("id");
        node.querySelectorAll("strong, b").forEach((s) => s.replaceWith(...s.childNodes));
      }
      if (clean2(node.textContent) || node.querySelector("img")) out.push(node);
    });
    return out;
  }
  function domPromo(card, document2) {
    const out = [];
    const name = iconName(card.querySelector(".card-icon span.icon"));
    if (name) {
      const p = document2.createElement("p");
      p.append(iconImg(name, document2));
      out.push(p);
    }
    const heading = card.querySelector(".card-headline-container h3, .card-headline-container h2, .card-headline-container h4");
    if (heading) {
      const h3 = document2.createElement("h3");
      h3.textContent = clean2(heading.textContent);
      out.push(h3);
    }
    card.querySelectorAll(".card-body-container p").forEach((src) => {
      const p = document2.createElement("p");
      p.textContent = clean2(src.textContent);
      out.push(p);
    });
    card.querySelectorAll(".card-label-container p").forEach((src) => {
      const p = document2.createElement("p");
      const em = document2.createElement("em");
      em.textContent = clean2(src.textContent);
      p.append(em);
      out.push(p);
    });
    const cta = card.querySelector(".button-container a[href]");
    if (cta) {
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = clean2(cta.textContent);
      strong.append(a);
      p.append(strong);
      out.push(p);
    }
    return out;
  }
  function parse3(element, { document: document2, params }) {
    const intro = [...element.querySelectorAll(".card-grid-content-container .card-grid-content-eyebrow-container p, .card-grid-content-container h2, .card-grid-content-container .card-grid-content-body-container p")];
    const cells = [["source", ARTICLE_INDEX2]];
    let paths = [];
    let visible = "";
    const promos = [];
    const rows = authoredRows(element, params);
    if (rows) {
      rows.forEach(({ key, value }) => {
        const insert = key.match(/^card\s*\(\s*insert-at-(\d+)\s*\)$/);
        if (key === "article-urls" || key === "paths") {
          const items = [...value.querySelectorAll("li")].map((li) => clean2(li.textContent));
          paths = items.length ? items : clean2(value.textContent).split(/[\s,]+/).filter(Boolean);
        } else if (key === "card-visible" || key === "visible") {
          visible = clean2(value.textContent);
        } else if (insert) {
          promos.push({ position: parseInt(insert[1], 10), content: importPromo(value, document2) });
        } else if (key === "content" && !intro.length) {
          value.querySelectorAll("h1, h2, h3").forEach((h) => {
            const node = document2.importNode(h, true);
            node.removeAttribute("id");
            intro.push(node);
          });
        }
      });
    }
    const cards = [...element.querySelectorAll(".cards-grid-container > .card")];
    if (!rows || !visible) {
      const shown = cards.filter((c) => !c.classList.contains("hidden-card")).length;
      if (shown && shown < cards.length) visible = String(shown);
    }
    if (!rows || !promos.length) {
      cards.forEach((card, i) => {
        if (card.classList.contains("has-image") || !card.querySelector(".card-inserted, .card-icon")) return;
        promos.push({ position: i + 1, content: domPromo(card, document2) });
      });
    }
    if (!rows || !paths.length) {
      const globs = [];
      cards.forEach((card) => {
        var _a, _b;
        const href = ((_b = (_a = card.querySelector("a.card-link[href]") || {}).getAttribute) == null ? void 0 : _b.call(_a, "href")) || "";
        const m = href.match(/^\/([^/]+)\/education\//);
        if (m && card.classList.contains("has-image")) {
          const glob = `/${m[1]}/education/*`;
          if (!globs.includes(glob)) globs.push(glob);
        }
      });
      paths = globs;
    }
    if (paths.length) cells.push(["paths", list(paths, document2)]);
    if (visible) cells.push(["visible", visible]);
    promos.sort((a, b) => a.position - b.position).forEach(({ position, content }) => {
      if (content.length) cells.push([`insert at ${position}`, content]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feed", cells });
    if (intro.length) element.before(...intro);
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-action.js
  function parse4(element, { document: document2 }) {
    const intro = [];
    const introRoot = element.querySelector(".card-grid-content-container");
    if (introRoot) {
      introRoot.querySelectorAll(".card-grid-content-eyebrow-container p, .card-grid-content-headline-container h2, .card-grid-content-headline-container h3, .card-grid-content-body-container p").forEach((el) => intro.push(el));
    }
    let cards = [...element.querySelectorAll(":scope > .card")];
    if (!cards.length) cards = [...element.querySelectorAll(".cards-grid-container > .card")];
    if (!cards.length) cards = [...element.querySelectorAll(".card")];
    const buildIcon = (card) => {
      const iconWrap = card.querySelector(".card-icon");
      if (!iconWrap) return null;
      const picture = iconWrap.querySelector("picture");
      if (picture) return picture;
      const img = iconWrap.querySelector("img");
      const span = iconWrap.querySelector("span.icon");
      const iconClass = span && [...span.classList].find((c) => c.startsWith("icon-"));
      const name = iconClass ? iconClass.replace(/^icon-/, "").replace(/^asset-/, "") : null;
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
    if (intro.length) element.before(...intro);
    element.replaceWith(block);
  }

  // tools/importer/parsers/banner-cta.js
  var ORIGIN3 = "https://www.pfizerforall.com";
  function parse5(element, { document: document2 }) {
    const content = [];
    const span = element.querySelector(".icon-container span.icon");
    const iconName2 = span && [...span.classList].find((c) => c.startsWith("icon-"));
    const iconImg2 = element.querySelector('.icon-container img:not([src^="data:"])');
    if (iconImg2 || iconName2) {
      const img = document2.createElement("img");
      img.src = iconImg2 ? new URL(iconImg2.getAttribute("src"), ORIGIN3).href : `${ORIGIN3}/assets/icons/${iconName2.replace(/^icon-/, "").replace(/^asset-/, "")}.svg?format=svg`;
      img.alt = iconImg2 && iconImg2.getAttribute("alt") || "";
      const p = document2.createElement("p");
      p.append(img);
      content.push(p);
    }
    const heading = element.querySelector(".content-container h1, .content-container h2, .content-container h3") || element.querySelector("h2, h3");
    if (heading) content.push(heading);
    element.querySelectorAll(".content-container p, .label-container p").forEach((p) => {
      if (p.textContent.trim()) content.push(p);
    });
    const cta = element.querySelector(".button-container a[href]") || element.querySelector("a.button[href]");
    if (cta) {
      const p = document2.createElement("p");
      p.append(cta);
      content.push(p);
    }
    if (!heading && !cta) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[content]];
    const variants = [];
    if (element.classList.contains("gradient")) variants.push("gradient");
    const ageInput = element.querySelector(".age-input-container");
    if (ageInput && cta) {
      variants.push("age-input");
      const labelEl = ageInput.querySelector("label");
      const label = labelEl ? labelEl.textContent.replace(/\s+/g, " ").trim() : "";
      let param = "age";
      try {
        const u = new URL(cta.getAttribute("href"), ORIGIN3);
        const empty = [...u.searchParams.entries()].find(([, v]) => v === "");
        if (empty) [param] = empty;
      } catch (e) {
      }
      cells.push([label, param]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "banner-cta", variants, cells });
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
      const list2 = Array.isArray(section.selector) ? section.selector : [section.selector];
      list2.forEach((sel) => {
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

  // tools/importer/import-education.js
  var parsers = {
    "hero-page": parse,
    "carousel-condition": parse2,
    "cards-feed": parse3,
    "cards-action": parse4,
    "banner-cta": parse5
  };
  var PAGE_TEMPLATE = {
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
  var import_education_default = {
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
  return __toCommonJS(import_education_exports);
})();
