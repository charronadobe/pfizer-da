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

  // tools/importer/import-content-page.js
  var import_content_page_exports = {};
  __export(import_content_page_exports, {
    default: () => import_content_page_default
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

  // tools/importer/parsers/cards-carousel.js
  var ORIGIN2 = "https://www.pfizerforall.com";
  function absUrl2(src) {
    try {
      return new URL(src, ORIGIN2).href;
    } catch (e) {
      return src;
    }
  }
  function buildIcon(card, document2) {
    const wrap = card.querySelector(".card-icon, .card-image");
    if (!wrap) return null;
    const img = wrap.querySelector("img");
    const raw = img ? img.getAttribute("src") || "" : "";
    if (raw && !raw.startsWith("data:")) {
      const out2 = document2.createElement("img");
      out2.src = absUrl2(raw.endsWith(".svg") ? `${raw}?format=svg` : raw);
      out2.alt = img.getAttribute("alt") || "";
      return out2;
    }
    const span = wrap.querySelector("span.icon");
    const name = span && [...span.classList].find((c) => c.startsWith("icon-"));
    if (!name) return null;
    const out = document2.createElement("img");
    out.src = `${ORIGIN2}/assets/icons/${name.replace(/^icon-/, "")}.svg?format=svg`;
    out.alt = "";
    return out;
  }
  function unwrapStrong(heading) {
    heading.querySelectorAll("strong, b").forEach((s) => s.replaceWith(...s.childNodes));
    return heading;
  }
  function parse2(element, { document: document2 }) {
    const intro = [];
    const introRoot = element.querySelector(".cards-carousel-content-section");
    if (introRoot) {
      introRoot.querySelectorAll(".cards-carousel-content-eyebrow-container p, .cards-carousel-content-headline-container h2, .cards-carousel-content-headline-container h3, .cards-carousel-content-body-container p").forEach((el) => intro.push(el));
    }
    let cards = [...element.querySelectorAll("ul.cards-list > li.card")];
    if (!cards.length) cards = [...element.querySelectorAll(".card")].filter((c) => !c.closest(".cards-carousel-content-section"));
    const cells = [];
    cards.forEach((card) => {
      const icon = buildIcon(card, document2);
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

  // tools/importer/parsers/cards-article.js
  var ORIGIN3 = "https://www.pfizerforall.com";
  function absUrl3(src) {
    try {
      return new URL(src, ORIGIN3).href;
    } catch (e) {
      return src;
    }
  }
  function buildImage(card, document2) {
    const img = card.querySelector(".card-image img");
    if (img) {
      const src = img.getAttribute("src") || "";
      if (src && !src.startsWith("data:")) {
        const out2 = document2.createElement("img");
        out2.src = absUrl3(src);
        out2.alt = img.getAttribute("alt") || "";
        return out2;
      }
    }
    const span = card.querySelector(".card-icon span.icon");
    const name = span && [...span.classList].find((c) => c.startsWith("icon-"));
    if (!name || name === "icon-hidden-icon") return null;
    const out = document2.createElement("img");
    out.src = `${ORIGIN3}/assets/icons/${name.replace(/^icon-/, "")}.svg?format=svg`;
    out.alt = "";
    return out;
  }
  var clean = (t) => t.replace(/\s+/g, " ").trim();
  function parse3(element, { document: document2 }) {
    const intro = [];
    const introRoot = element.querySelector(".cards-carousel-content-section");
    if (introRoot) {
      introRoot.querySelectorAll(".cards-carousel-content-eyebrow-container p, .cards-carousel-content-headline-container h2, .cards-carousel-content-headline-container h3, .cards-carousel-content-body-container p").forEach((el) => intro.push(el));
    }
    let cards = [...element.querySelectorAll("ul.cards-list > li.card")];
    if (!cards.length) cards = [...element.querySelectorAll(".card")].filter((c) => !c.closest(".cards-carousel-content-section"));
    const cells = [];
    cards.forEach((card) => {
      const image = buildImage(card, document2);
      const content = card.querySelector(".card-content") || card;
      const text = [];
      const badges = [...content.querySelectorAll(".card-badge-container .badge")].filter((b) => clean(b.textContent));
      if (badges.length) {
        const p = document2.createElement("p");
        badges.forEach((b, i) => {
          if (i) p.append(document2.createTextNode(", "));
          const label = clean(b.textContent);
          if (b.classList.contains("badge--recommended")) {
            const strong = document2.createElement("strong");
            strong.textContent = label;
            p.append(strong);
          } else {
            p.append(document2.createTextNode(label));
          }
        });
        text.push(p);
      }
      const heading = content.querySelector(".card-headline-container h2, .card-headline-container h3, .card-headline-container h4") || content.querySelector("h2, h3, h4");
      if (heading) text.push(heading);
      content.querySelectorAll(".card-body-container p").forEach((p) => text.push(p));
      content.querySelectorAll(".card-label-container p").forEach((p) => {
        const label = clean(p.textContent);
        if (!label) return;
        const out = document2.createElement("p");
        const em = document2.createElement("em");
        em.textContent = label;
        out.append(em);
        text.push(out);
      });
      content.querySelectorAll(".button-container a[href]").forEach((a) => {
        const p = document2.createElement("p");
        p.append(a);
        text.push(p);
      });
      if (!image && !text.length) return;
      cells.push([image || "", text.length ? text : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-article", cells });
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
  function parse4(element, { document: document2, params }) {
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

  // tools/importer/parsers/hero-article.js
  var ORIGIN4 = "https://www.pfizerforall.com";
  function absUrl4(src) {
    try {
      return new URL(src, ORIGIN4).href;
    } catch (e) {
      return src;
    }
  }
  function desktopImage2(picture, document2) {
    if (!picture) return null;
    const img = picture.querySelector("img");
    const sources = [...picture.querySelectorAll("source")];
    const desktop = sources.find((s) => /min-width:\s*1024px/.test(s.getAttribute("media") || "") && !/webp/.test(s.getAttribute("type") || "") && !/format=webply/.test(s.getAttribute("srcset") || ""));
    let src = desktop ? (desktop.getAttribute("srcset") || "").trim().split(/\s+/)[0] : "";
    if (!src && img) src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) return null;
    const out = document2.createElement("img");
    out.src = absUrl4(src);
    out.alt = img && img.getAttribute("alt") || "";
    return out;
  }
  var clean2 = (t) => t.replace(/\s+/g, " ").trim();
  function parse5(element, { document: document2 }) {
    const image = desktopImage2(element.querySelector(".content-section-image-container picture") || element.querySelector("picture"), document2);
    const heading = element.querySelector(".featured-article-content-headline-container h2, .featured-article-content-headline-container h3") || element.querySelector("h2, h3");
    const body = [...element.querySelectorAll(".featured-article-content-body-container p")];
    if (!heading && !body.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const content = [];
    if (image) content.push(image);
    const tags = [...element.querySelectorAll(".badge-container .badge")].map((b) => clean2(b.textContent)).filter(Boolean);
    if (tags.length) {
      const p = document2.createElement("p");
      p.textContent = tags.join(", ");
      content.push(p);
    }
    if (heading) content.push(heading);
    content.push(...body);
    element.querySelectorAll(".featured-article-content-label-container p").forEach((p) => {
      if (clean2(p.textContent)) content.push(p);
    });
    element.querySelectorAll(".featured-article-content-wrapper .button-container a[href], .featured-article-content-wrapper a.button[href]").forEach((a) => {
      if (content.some((el) => el.contains && el.contains(a))) return;
      const p = document2.createElement("p");
      p.append(a);
      content.push(p);
    });
    const cells = [[content]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/banner-cta.js
  var ORIGIN5 = "https://www.pfizerforall.com";
  function parse6(element, { document: document2 }) {
    const content = [];
    const span = element.querySelector(".icon-container span.icon");
    const iconName = span && [...span.classList].find((c) => c.startsWith("icon-"));
    const iconImg = element.querySelector('.icon-container img:not([src^="data:"])');
    if (iconImg || iconName) {
      const img = document2.createElement("img");
      img.src = iconImg ? new URL(iconImg.getAttribute("src"), ORIGIN5).href : `${ORIGIN5}/assets/icons/${iconName.replace(/^icon-/, "").replace(/^asset-/, "")}.svg?format=svg`;
      img.alt = iconImg && iconImg.getAttribute("alt") || "";
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
        const u = new URL(cta.getAttribute("href"), ORIGIN5);
        const empty = [...u.searchParams.entries()].find(([, v]) => v === "");
        if (empty) [param] = empty;
      } catch (e) {
      }
      cells.push([label, param]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "banner-cta", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-nav.js
  var clean3 = (t) => t.replace(/\s+/g, " ").trim();
  function parse7(element, { document: document2 }) {
    const intro = [];
    const introRoot = element.querySelector(".card-grid-content-container");
    if (introRoot) {
      introRoot.querySelectorAll(".card-grid-content-eyebrow-container p, .card-grid-content-headline-container h2, .card-grid-content-headline-container h3, .card-grid-content-body-container p").forEach((el) => intro.push(el));
    }
    let cards = [...element.querySelectorAll(".cards-grid-container > .card")];
    if (!cards.length) cards = [...element.querySelectorAll(".card")];
    const cells = [];
    cards.forEach((card) => {
      const headingEl = card.querySelector(".card-headline-container h2, .card-headline-container h3, .card-headline-container h4");
      const link = card.querySelector(".card-title-icon a[href], .button-container a[href]") || card.querySelector("a.card-link[href]") || card.querySelector("a[href]");
      const title = clean3((headingEl || link || { textContent: "" }).textContent);
      if (!title && !link) return;
      const h3 = document2.createElement("h3");
      if (link) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = title || clean3(link.textContent);
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      const cell = [h3];
      card.querySelectorAll(".card-body-container p").forEach((p) => {
        if (clean3(p.textContent)) cell.push(p);
      });
      cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const variants = element.classList.contains("core-title-icon") ? ["blue"] : [];
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-nav", variants, cells });
    if (intro.length) element.before(...intro);
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-action.js
  function parse8(element, { document: document2 }) {
    const intro = [];
    const introRoot = element.querySelector(".card-grid-content-container");
    if (introRoot) {
      introRoot.querySelectorAll(".card-grid-content-eyebrow-container p, .card-grid-content-headline-container h2, .card-grid-content-headline-container h3, .card-grid-content-body-container p").forEach((el) => intro.push(el));
    }
    let cards = [...element.querySelectorAll(":scope > .card")];
    if (!cards.length) cards = [...element.querySelectorAll(".cards-grid-container > .card")];
    if (!cards.length) cards = [...element.querySelectorAll(".card")];
    const buildIcon3 = (card) => {
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
      const icon = buildIcon3(card);
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

  // tools/importer/parsers/quiz-choice.js
  var plainCache;
  function loadPlain2(params) {
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
  var clean4 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function readConfig(blockEl) {
    const cfg = {};
    [...blockEl.children].forEach((row) => {
      const [k, v] = [...row.children];
      if (k && v) cfg[clean4(k.textContent).toLowerCase()] = v;
    });
    return cfg;
  }
  function authoredConfig(element, blockClass, questionText, params) {
    const plain = loadPlain2(params);
    if (!plain) return null;
    const blocks = [...plain.querySelectorAll(`div.${blockClass}`)];
    if (!blocks.length) return null;
    const configs = blocks.map(readConfig);
    const q = clean4(questionText).toLowerCase();
    let match = configs.find((c) => c.question && clean4(c.question.textContent).toLowerCase() === q);
    if (!match) {
      const doc = element.ownerDocument;
      const idx = [...doc.querySelectorAll(`.${blockClass}.block`)].indexOf(element);
      match = configs[idx >= 0 ? idx : 0];
    }
    return match;
  }
  function importContent(cell, document2) {
    const out = [];
    [...cell.children].forEach((el) => {
      const node = document2.importNode(el, true);
      if (/^H[1-6]$/.test(node.tagName)) {
        node.querySelectorAll("strong, b").forEach((s) => s.replaceWith(...s.childNodes));
        node.removeAttribute("id");
      }
      if (node.tagName === "P") {
        const a = node.querySelector("a[href]");
        if (a && clean4(node.textContent) === clean4(a.textContent)) {
          const link = document2.createElement("a");
          link.href = a.getAttribute("href");
          link.textContent = clean4(a.textContent);
          node.replaceChildren(link);
        }
      }
      out.push(node);
    });
    if (!out.length && clean4(cell.textContent)) {
      const p = document2.createElement("p");
      p.textContent = clean4(cell.textContent);
      out.push(p);
    }
    return out;
  }
  function parse9(element, { document: document2, params }) {
    const heading = element.querySelector(".question-1-6-content-headline-container h2, .question-1-6-content-headline-container h3") || element.querySelector("h2, h3");
    const labels = [...element.querySelectorAll(".question-tile-grid button.tile, .question-tiles-container button.tile")].filter((b, i, arr) => arr.indexOf(b) === i).map((b) => clean4((b.querySelector(".tile-label") || b).textContent)).filter(Boolean);
    const cfg = authoredConfig(element, "question-1-6", heading ? heading.textContent : "", params);
    const cells = [];
    if (heading) {
      const h2 = document2.createElement("h2");
      h2.textContent = clean4(heading.textContent);
      cells.push([h2]);
    } else if (cfg && cfg.question) {
      const h2 = document2.createElement("h2");
      h2.textContent = clean4(cfg.question.textContent);
      cells.push([h2]);
    }
    const options = [];
    if (cfg) {
      Object.keys(cfg).filter((k) => /^option\d+$/.test(k)).sort((a, b) => parseInt(a.slice(6), 10) - parseInt(b.slice(6), 10)).forEach((k) => {
        const n = k.slice(6);
        options.push({ label: clean4(cfg[k].textContent), answer: cfg[`answer${n}`] ? importContent(cfg[`answer${n}`], document2) : [] });
      });
    }
    if (!options.length) {
      const rendered = [...element.querySelectorAll(".question-answer-container .question-answer-type-stack > *, .question-answer-container .question-answer-button-wrapper a[href]")];
      labels.forEach((label, i) => options.push({ label, answer: i === 0 ? rendered : [] }));
    }
    options.forEach(({ label, answer }) => {
      if (!label) return;
      cells.push([label, answer.length ? answer : ""]);
    });
    if (!options.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "quiz-choice", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-article.js
  var ORIGIN6 = "https://www.pfizerforall.com";
  function absUrl5(src) {
    try {
      return new URL(src, ORIGIN6).href;
    } catch (e) {
      return src;
    }
  }
  function desktopImage3(picture, document2) {
    if (!picture) return null;
    const img = picture.querySelector("img");
    const source = [...picture.querySelectorAll("source")].find((s) => /min-width/.test(s.getAttribute("media") || "") && !/webp/.test(s.getAttribute("type") || "") && !/format=webply/.test(s.getAttribute("srcset") || ""));
    let src = source ? (source.getAttribute("srcset") || "").trim().split(/\s+/)[0] : "";
    if (!src && img) src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) return null;
    const out = document2.createElement("img");
    out.src = absUrl5(src);
    out.alt = img && img.getAttribute("alt") || "";
    return out;
  }
  var clean5 = (t) => t.replace(/\s+/g, " ").trim();
  function parse10(element, { document: document2 }) {
    const intro = [...element.querySelectorAll(".image-top-heading h2, .image-top-heading h3, .image-top-heading p")];
    const picture = element.querySelector(".image-container .desktop-image picture") || element.querySelector(".image-container picture");
    const image = desktopImage3(picture, document2);
    const content = element.querySelector(".content-container") || element;
    const text = [];
    const tags = [...content.querySelectorAll(".badge-container .badge")].map((b) => clean5(b.textContent)).filter(Boolean);
    if (tags.length) {
      const p = document2.createElement("p");
      p.textContent = tags.join(", ");
      text.push(p);
    }
    const heading = content.querySelector(".image-content-headline-container h2, .image-content-headline-container h3, .image-content-headline-container h4");
    if (heading) text.push(heading);
    content.querySelectorAll(".image-content-body-container p").forEach((p) => text.push(p));
    content.querySelectorAll(".image-content-label-container p").forEach((p) => {
      const label = clean5(p.textContent);
      if (!label) return;
      const out = document2.createElement("p");
      const em = document2.createElement("em");
      em.textContent = label;
      out.append(em);
      text.push(out);
    });
    content.querySelectorAll(".button-group a[href], p.button-container a[href]").forEach((a) => {
      if (text.some((el) => el.contains(a))) return;
      const p = document2.createElement("p");
      p.append(a);
      text.push(p);
    });
    if (!heading && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[text.length ? text : "", image || ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-article", cells });
    if (intro.length) element.before(...intro);
    element.replaceWith(block);
  }

  // tools/importer/parsers/quiz-truefalse.js
  var plainCache2;
  function loadPlain3(params) {
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
  var clean6 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function readConfig2(blockEl) {
    const cfg = {};
    [...blockEl.children].forEach((row) => {
      const [k, v] = [...row.children];
      if (k && v) cfg[clean6(k.textContent).toLowerCase()] = v;
    });
    return cfg;
  }
  function authoredConfig2(element, blockClass, questionText, params) {
    const plain = loadPlain3(params);
    if (!plain) return null;
    const configs = [...plain.querySelectorAll(`div.${blockClass}`)].map(readConfig2);
    if (!configs.length) return null;
    const q = clean6(questionText).toLowerCase();
    let match = configs.find((c) => c.question && clean6(c.question.textContent).toLowerCase() === q);
    if (!match) {
      const idx = [...element.ownerDocument.querySelectorAll(`.${blockClass}.block`)].indexOf(element);
      match = configs[idx >= 0 ? idx : 0];
    }
    return match;
  }
  function importContent2(cell, document2) {
    if (!cell) return [];
    const out = [];
    const kids = [...cell.childNodes].filter((n) => n.nodeType === 1 || clean6(n.textContent));
    const blockLevel = kids.every((n) => n.nodeType === 1 && /^(P|H[1-6]|UL|OL|DIV)$/.test(n.tagName));
    if (!blockLevel) {
      const p = document2.createElement("p");
      kids.forEach((n) => p.append(document2.importNode(n, true)));
      if (clean6(p.textContent)) out.push(p);
    } else {
      kids.forEach((n) => out.push(document2.importNode(n, true)));
    }
    out.forEach((node) => {
      if (node.tagName !== "P") return;
      const a = node.querySelector("a[href]");
      if (a && clean6(node.textContent) === clean6(a.textContent)) {
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = clean6(a.textContent);
        node.replaceChildren(link);
      }
    });
    return out;
  }
  var serialize = (nodes) => nodes.map((n) => n.outerHTML).join("");
  function parse11(element, { document: document2, params }) {
    const blockClass = element.classList.contains("question-1-2") ? "question-1-2" : element.classList.contains("true-false") ? "true-false" : [...element.classList][0];
    const eyebrow = element.querySelector('[class*="eyebrow-container"] p');
    const heading = element.querySelector('[class*="headline-container"] h2:not([class*="result"]), [class*="headline-container"] h3:not([class*="result"])');
    const source = [...element.querySelectorAll('[class*="label-container"] p')].filter((p) => clean6(p.textContent));
    const buttonLabels = [...element.querySelectorAll('[class*="action-container"] button')].map((b) => clean6((b.querySelector('[class*="answer-text"]') || b).textContent)).filter(Boolean);
    if (!heading && !buttonLabels.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cfg = authoredConfig2(element, blockClass, heading ? heading.textContent : "", params);
    const intro = [];
    if (eyebrow && clean6(eyebrow.textContent)) {
      const p = document2.createElement("p");
      p.textContent = clean6(eyebrow.textContent);
      intro.push(p);
    }
    if (heading) {
      const h2 = document2.createElement("h2");
      h2.textContent = clean6(heading.textContent);
      intro.push(h2);
    }
    source.forEach((p) => {
      const out = document2.createElement("p");
      const em = document2.createElement("em");
      em.textContent = clean6(p.textContent);
      out.append(em);
      intro.push(out);
    });
    const cells = [[intro]];
    const correctLabel = cfg && cfg.correct_answer ? clean6(cfg.correct_answer.textContent) : "";
    const labels = buttonLabels.length ? buttonLabels : [correctLabel, cfg && cfg.incorrect_answer ? clean6(cfg.incorrect_answer.textContent) : ""].filter(Boolean);
    const feedbackFor = (kind) => {
      if (!cfg) return { heading: [], body: [], cta: [] };
      const h = cfg[`${kind}_heading`];
      const headingEl = [];
      if (h && clean6(h.textContent)) {
        const h3 = document2.createElement("h3");
        h3.textContent = clean6(h.textContent);
        headingEl.push(h3);
      }
      return {
        heading: headingEl,
        body: importContent2(cfg[`${kind}_body`], document2),
        cta: importContent2(cfg[`cta_${kind}`], document2)
      };
    };
    const right = feedbackFor("correct");
    const wrong = feedbackFor("incorrect");
    const shared = cfg && serialize(right.body) === serialize(wrong.body) && serialize(right.cta) === serialize(wrong.cta) && (right.body.length || right.cta.length);
    labels.forEach((label) => {
      const isCorrect = !!correctLabel && label.toLowerCase() === correctLabel.toLowerCase();
      const fb = isCorrect ? right : wrong;
      const feedback = shared ? [...fb.heading] : [...fb.heading, ...fb.body, ...fb.cta];
      cells.push([label, feedback.length ? feedback : "", isCorrect ? "Correct" : ""]);
    });
    if (shared) cells.push([[...right.body, ...right.cta]]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "quiz-truefalse", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form-signup.js
  var ORIGIN7 = "https://www.pfizerforall.com";
  var FORMS_SERVICE = {
    production: "https://ms-forms-service-production.digitalpfizer.com/api/v2/forms",
    uat: "https://ms-forms-service-uat.digitalpfizer.com/api/v2/forms"
  };
  var plainCache3;
  function loadPlain4(params) {
    if (plainCache3 !== void 0) return plainCache3;
    plainCache3 = null;
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
            plainCache3 = new DOMParser().parseFromString(xhr.responseText, "text/html");
            return plainCache3;
          }
        } catch (e) {
        }
      }
    }
    return plainCache3;
  }
  var clean7 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function readConfig3(blockEl) {
    const cfg = {};
    [...blockEl.children].forEach((row) => {
      const [k, v] = [...row.children];
      if (k && v) cfg[clean7(k.textContent).toLowerCase()] = v;
    });
    return cfg;
  }
  function authoredConfig3(element, headingText, params) {
    const plain = loadPlain4(params);
    if (!plain) return null;
    const configs = [...plain.querySelectorAll("div.form")].map(readConfig3);
    const h = clean7(headingText).toLowerCase();
    return configs.find((c) => c.headline && clean7(c.headline.textContent).toLowerCase().includes(h)) || configs[Math.max(0, [...element.ownerDocument.querySelectorAll(".form.block")].indexOf(element))] || null;
  }
  function serviceMessages(cfg) {
    const out = {};
    if (!cfg || !cfg["form-token"]) return out;
    const tokens = clean7(cfg["form-token"].textContent).split(" ").filter(Boolean);
    const prod = tokens.find((t) => /production/.test(t));
    const attempts = [];
    if (prod) attempts.push([FORMS_SERVICE.production, prod]);
    tokens.filter((t) => t !== prod).forEach((t) => attempts.push([FORMS_SERVICE.uat, t]));
    for (const [endpoint, token] of attempts) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", endpoint, false);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("x-config-token", token);
        xhr.send();
        if (xhr.status !== 200) continue;
        const json = JSON.parse(xhr.responseText);
        (json.data && json.data.fields || []).forEach((f) => {
          const validators = f.validators || [];
          const v = validators.find((x) => x.type === "required") || validators[0];
          if (f.name && v && v.message) out[f.name] = v.message;
        });
        if (Object.keys(out).length) return out;
      } catch (e) {
      }
    }
    return out;
  }
  function iconImage(name, document2) {
    const img = document2.createElement("img");
    img.src = `${ORIGIN7}/assets/icons/${name}.svg?format=svg`;
    img.alt = "";
    return img;
  }
  function iconFrom(container, document2) {
    const span = container && container.querySelector("span.icon");
    const name = span && [...span.classList].find((c) => c.startsWith("icon-"));
    return name ? iconImage(name.replace(/^icon-/, "").replace(/^asset-/, ""), document2) : null;
  }
  function parse12(element, { document: document2, params }) {
    const left = element.querySelector(".form-left-content") || element;
    const formEl = element.querySelector("form");
    const heading = left.querySelector(".form-headline-container h2, .form-headline-container h3") || element.querySelector("h2, h3");
    if (!heading && !formEl) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cfg = authoredConfig3(element, heading ? heading.textContent : "", params);
    const intro = [];
    const icon = iconFrom(left.querySelector(".form-headline-container"), document2) || (cfg && cfg.headline ? iconFrom(cfg.headline, document2) : null);
    if (icon) {
      const p = document2.createElement("p");
      p.append(icon);
      intro.push(p);
    }
    if (heading) intro.push(heading);
    left.querySelectorAll(".form-body-section p").forEach((p) => {
      if (clean7(p.textContent)) intro.push(p);
    });
    const messages = serviceMessages(cfg);
    const formCell = [];
    const list = document2.createElement("ul");
    (formEl ? [...formEl.querySelectorAll(".form-text-field")] : []).forEach((field) => {
      const input = field.querySelector("input");
      const label = clean7((field.querySelector("label") || {}).textContent || input && input.getAttribute("placeholder"));
      if (!label) return;
      const li = document2.createElement("li");
      li.append(document2.createTextNode(label));
      const message = input && messages[input.name] || clean7((field.querySelector(".input-supporting-text") || {}).textContent);
      const clear = field.querySelector(".input-clear-button");
      const clearLabel = clear ? clean7(clear.getAttribute("aria-label")) : "";
      if (message) {
        const sub = document2.createElement("ul");
        [message, clearLabel].filter(Boolean).forEach((t) => {
          const item = document2.createElement("li");
          item.textContent = t;
          sub.append(item);
        });
        li.append(sub);
      }
      list.append(li);
    });
    if (list.children.length) formCell.push(list);
    const submitBtn = formEl && formEl.querySelector("button[type=submit]");
    const submitLabel = submitBtn ? clean7((submitBtn.querySelector(".button__label") || submitBtn).textContent) : "";
    if (submitLabel) {
      let endpoint = formEl.getAttribute("action") || "";
      if (!endpoint) {
        let slug = "page";
        try {
          const u = new URL(params && params.originalURL || window.location.href);
          slug = u.pathname.split("/").filter(Boolean)[0] || "home";
        } catch (e) {
        }
        endpoint = `/global/forms/signup-${slug}-form`;
      }
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const a = document2.createElement("a");
      a.href = endpoint;
      a.textContent = submitLabel;
      strong.append(a);
      p.append(strong);
      formCell.push(p);
    }
    element.querySelectorAll(".form-content-footer-section p").forEach((p) => {
      if (clean7(p.textContent)) formCell.push(p);
    });
    const cells = [[intro.length ? intro : "", formCell.length ? formCell : ""]];
    if (cfg && cfg["success-text"]) {
      const success = [];
      [...cfg["success-text"].children].forEach((el) => {
        const ic = el.querySelector("span.icon");
        if (ic && !clean7(el.textContent)) {
          const node2 = iconFrom(el, document2);
          if (node2) {
            const p = document2.createElement("p");
            p.append(node2);
            success.push(p);
          }
          return;
        }
        let node = document2.importNode(el, true);
        if (/^H[1-6]$/.test(node.tagName)) {
          const h3 = document2.createElement("h3");
          h3.innerHTML = node.innerHTML;
          node = h3;
        }
        node.removeAttribute("id");
        success.push(node);
      });
      if (success.length) cells.push([success]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "form-signup", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  var clean8 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function parse13(element, { document: document2 }) {
    const intro = [...element.querySelectorAll(".accordion-basic-content-section h2, .accordion-basic-content-section h3, .accordion-basic-content-section p, .accordion-content-section h2, .accordion-content-section h3, .accordion-content-section p")].filter((el) => clean8(el.textContent));
    let items = [...element.querySelectorAll(".accordion-basic-accordion-stack > details, .accordion-card-stack > details")];
    if (!items.length) items = [...element.querySelectorAll("details")];
    const cells = [];
    items.forEach((item) => {
      const labelEl = item.querySelector("summary .accordion-basic-card__label, summary .accordion-title-label") || item.querySelector("summary");
      const question = clean8(labelEl ? labelEl.textContent : "");
      if (!question) return;
      const content = item.querySelector(".accordion-basic-card__expanded-content, .accordion-expanded-content") || item;
      const answer = [];
      content.querySelectorAll(".accordion-basic-card__body-container, .accordion-card-body-container").forEach((body) => {
        [...body.children].forEach((el) => {
          if (clean8(el.textContent) || el.querySelector("img, picture")) answer.push(el);
        });
      });
      content.querySelectorAll(".accordion-basic-card-button-group a[href]").forEach((a) => {
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = clean8(a.textContent);
        const p = document2.createElement("p");
        p.append(link);
        answer.push(p);
      });
      content.querySelectorAll(".accordion-basic-card__label-container p").forEach((p) => {
        if (clean8(p.textContent)) answer.push(p);
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
  var clean9 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function parse14(element, { document: document2 }) {
    const labelEl = element.querySelector(".search-block-text-2-1-input label, label.input-label");
    const input = element.querySelector('input.input-field, input[type="text"], input[type="search"]');
    const placeholder = clean9(labelEl ? labelEl.textContent : "") || clean9(input && input.getAttribute("placeholder"));
    const button = element.querySelector('.search-block-text-2-1-button button, button[type="submit"]');
    const buttonLabel = clean9(button ? (button.querySelector(".button__label") || button).textContent : "");
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

  // tools/importer/parsers/quiz-entry.js
  var ORIGIN8 = "https://www.pfizerforall.com";
  var plainCache4;
  function loadPlain5(params) {
    if (plainCache4 !== void 0) return plainCache4;
    plainCache4 = null;
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
            plainCache4 = new DOMParser().parseFromString(xhr.responseText, "text/html");
            return plainCache4;
          }
        } catch (e) {
        }
      }
    }
    return plainCache4;
  }
  var clean10 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function authoredLinks(questionText, params) {
    const plain = loadPlain5(params);
    const map = {};
    if (!plain) return map;
    const q = clean10(questionText).toLowerCase();
    const blocks = [...plain.querySelectorAll("div.entry-quiz")];
    const match = blocks.find((b) => [...b.querySelectorAll("h1, h2, h3, h4")].some((h) => clean10(h.textContent).toLowerCase() === q)) || blocks[0];
    if (!match) return map;
    match.querySelectorAll("li a[href]").forEach((a) => {
      map[clean10(a.textContent).toLowerCase()] = a.getAttribute("href");
    });
    return map;
  }
  function parse15(element, { document: document2, params }) {
    const intro = [...element.querySelectorAll(".intro-section .headline-container h2, .intro-section .headline-container h3, .intro-section .body-container p")].filter((el) => clean10(el.textContent));
    const question = element.querySelector(".question-section .question-headline-container h3, .question-section h3, .question-section h2");
    const labels = [...element.querySelectorAll(".selection-tiles .selection-tile")].map((t) => clean10((t.querySelector(".text-label") || t).textContent)).filter(Boolean);
    if (!question && !labels.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const links = authoredLinks(question ? question.textContent : "", params);
    const cells = [];
    if (question) {
      const h3 = document2.createElement("h3");
      h3.textContent = clean10(question.textContent);
      cells.push([h3]);
    }
    labels.forEach((label) => {
      const href = links[label.toLowerCase()];
      let target = "";
      if (href) {
        target = document2.createElement("a");
        target.href = href;
        target.textContent = label;
      }
      cells.push([label, target]);
    });
    const footer = [];
    const button = element.querySelector(".buttons-container button, .button-group button");
    const buttonLabel = clean10(button ? (button.querySelector(".button__label") || button).textContent : "");
    if (buttonLabel) {
      const p = document2.createElement("p");
      p.textContent = buttonLabel;
      footer.push(p);
    }
    const note = element.querySelector(".time-indicator");
    if (note && clean10(note.textContent)) {
      const p = document2.createElement("p");
      const span = note.querySelector("span.icon");
      const name = span && [...span.classList].find((c) => c.startsWith("icon-"));
      if (name) {
        const img = document2.createElement("img");
        img.src = `${ORIGIN8}/assets/icons/${name.replace(/^icon-/, "")}.svg?format=svg`;
        img.alt = "";
        p.append(img, document2.createTextNode(" "));
      }
      p.append(document2.createTextNode(clean10(note.textContent)));
      footer.push(p);
    }
    if (footer.length) cells.push([footer]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "quiz-entry", cells });
    if (intro.length) element.before(...intro);
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-fact.js
  var clean11 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function heading3(el, document2) {
    const h3 = document2.createElement("h3");
    h3.textContent = clean11(el.textContent);
    return h3;
  }
  function parse16(element, { document: document2 }) {
    const intro = [...element.querySelectorAll(".vertical-card-content-section h2, .vertical-card-content-section h3, .vertical-card-content-section p")].filter((el) => clean11(el.textContent));
    let items = [...element.querySelectorAll(".vertical-card-stacked > .vertical-card-item")];
    if (!items.length) items = [...element.querySelectorAll(".vertical-card-item")];
    const cells = [];
    items.forEach((item) => {
      const cell = [];
      const topic = item.querySelector(".vertical-card-topic h1, .vertical-card-topic h2, .vertical-card-topic h3, .vertical-card-topic h4, .vertical-card-topic p");
      if (topic && clean11(topic.textContent)) cell.push(heading3(topic, document2));
      const statement = item.querySelector(".vertical-card-heading h1, .vertical-card-heading h2, .vertical-card-heading h3, .vertical-card-heading h4, .vertical-card-heading p");
      if (statement && clean11(statement.textContent)) cell.push(heading3(statement, document2));
      const cta = item.querySelector(".vertical-card-button-group a.button[href], a.button.text[href]");
      item.querySelectorAll(".vertical-card-body p, .vertical-card-body ul, .vertical-card-body ol").forEach((el) => {
        if (el.closest(".vertical-card-button-group") || cta && el.contains(cta)) return;
        if (clean11(el.textContent)) cell.push(el);
      });
      if (cta && clean11(cta.textContent)) {
        const link = document2.createElement("a");
        link.href = cta.getAttribute("href");
        const title = cta.getAttribute("title");
        if (title) link.title = title;
        link.textContent = clean11(cta.textContent);
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

  // tools/importer/parsers/quote-photo.js
  function pageUrl2(params) {
    if (params && params.originalURL) return params.originalURL;
    try {
      if (/^https?:/.test(window.location.href)) return window.location.href;
    } catch (e) {
    }
    return "";
  }
  function toImage(picture, document2, base) {
    const img = picture && picture.querySelector("img");
    if (!img) return null;
    let src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) return null;
    if (base && !/^https?:/.test(src)) {
      try {
        src = new URL(src, base).href;
      } catch (e) {
      }
    }
    const out = document2.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  var clean12 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function parse17(element, { document: document2, params }) {
    const base = pageUrl2(params);
    const desktop = toImage(element.querySelector(".quote-desktop-image picture"), document2, base) || toImage(element.querySelector(".quote-image-background picture"), document2, base);
    const mobile = toImage(element.querySelector(".quote-mobile-image picture"), document2, base);
    const images = [];
    if (desktop) images.push(desktop);
    if (mobile && (!desktop || mobile.src !== desktop.src)) images.push(mobile);
    const content = element.querySelector(".quote-content-container") || element;
    const text = [];
    const quote = content.querySelector(".quote-text-container h1, .quote-text-container h2, .quote-text-container h3, .quote-text-container p");
    if (quote) text.push(quote);
    content.querySelectorAll(".quote-label-container p").forEach((p) => {
      if (clean12(p.textContent)) text.push(p);
    });
    content.querySelectorAll(".quote-button-container a[href]").forEach((a) => {
      const p = document2.createElement("p");
      p.append(a);
      text.push(p);
    });
    if (!quote && !images.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[images.length ? images : "", text.length ? text : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "quote-photo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  var ORIGIN9 = "https://www.pfizerforall.com";
  var clean13 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function buildIcon2(card, document2) {
    const wrap = card.querySelector(".icon-list-card-icon");
    if (!wrap) return null;
    const img = wrap.querySelector("img");
    const raw = img ? img.getAttribute("src") || "" : "";
    const out = document2.createElement("img");
    out.alt = "";
    if (raw && !raw.startsWith("data:")) {
      const abs = new URL(raw, ORIGIN9).href;
      out.src = /\.svg$/.test(abs) ? `${abs}?format=svg` : abs;
      out.alt = img.getAttribute("alt") || "";
      return out;
    }
    const span = wrap.querySelector("span.icon");
    const name = span && [...span.classList].find((c) => c.startsWith("icon-"));
    if (!name) return null;
    out.src = `${ORIGIN9}/assets/icons/${name.replace(/^icon-/, "").replace(/^asset-/, "")}.svg?format=svg`;
    return out;
  }
  function parse18(element, { document: document2 }) {
    const intro = [...element.querySelectorAll(".icon-list-content h2, .icon-list-content h3, .icon-list-content p")].filter((el) => clean13(el.textContent));
    let cards = [...element.querySelectorAll(".icon-list-container > .icon-list-card")];
    if (!cards.length) cards = [...element.querySelectorAll(".icon-list-card")];
    const cells = [];
    cards.forEach((card) => {
      const icon = buildIcon2(card, document2);
      const copy = card.querySelector(".icon-list-card-copy") || card;
      const text = [];
      const heading = copy.querySelector("h2, h3, h4");
      if (heading) {
        const h3 = document2.createElement("h3");
        h3.textContent = clean13(heading.textContent);
        text.push(h3);
      }
      copy.querySelectorAll("p").forEach((p) => {
        if (clean13(p.textContent)) text.push(p);
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

  // tools/importer/import-content-page.js
  var parsers = {
    "hero-page": parse,
    "cards-carousel": parse2,
    "cards-article": parse3,
    "columns-media": parse4,
    "hero-article": parse5,
    "banner-cta": parse6,
    "cards-nav": parse7,
    "cards-action": parse8,
    "quiz-choice": parse9,
    "columns-article": parse10,
    "quiz-truefalse": parse11,
    "form-signup": parse12,
    "accordion-faq": parse13,
    "search-prompt": parse14,
    "quiz-entry": parse15,
    "cards-fact": parse16,
    "quote-photo": parse17,
    "cards-icon": parse18
  };
  var PAGE_TEMPLATE = {
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
  var import_content_page_default = {
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
  return __toCommonJS(import_content_page_exports);
})();
