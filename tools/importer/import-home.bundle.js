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
  function parse(element, { document: document2, params }) {
    const slides = [...element.querySelectorAll(".hero-overlay-slide")];
    const backgrounds = [...element.querySelectorAll(".hero-carousel-backgrounds > .hero-carousel-background-item, .hero-carousel-background-item")].filter((el, idx, arr) => arr.indexOf(el) === idx);
    const videoLink = (src) => {
      let href = src;
      try {
        href = new URL(src, params == null ? void 0 : params.originalURL).href;
      } catch (e) {
      }
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = href;
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
        const iconName = iconClass ? iconClass.replace(/^icon-/, "").replace(/^asset-/, "") : null;
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
  function parse4(element, { document: document2, params }) {
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
  function loadPlain2(params) {
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
    const plain = loadPlain2(params);
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
  function parse5(element, { document: document2, params }) {
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
