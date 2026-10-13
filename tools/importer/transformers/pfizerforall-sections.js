/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: pfizerforall.com section breaks and Section Metadata.
 *
 * payload.template.sections[] entries are class-based RULES: each rule's
 * `selector` array is a list of alternative selectors, and every selector may
 * match SEVERAL section elements on one page (e.g. content-page
 * `#main > div.section.image-1-1-container:not(:has(.image-1-1.core-lighter))`
 * matches 3 sections on /cancer). The home template uses one-element selectors
 * (e.g. `.section.image-1-2-container:nth-of-type(4)`), which is just the
 * single-match special case of the same logic.
 *
 * Algorithm:
 *  - Collect every element matched by every selector of every rule
 *    (querySelectorAll). An element matched by several rules is kept once; the
 *    first rule in sections[] wins.
 *  - Sort matched elements in document order. Insert an <hr> before every
 *    matched element except the first one on the page.
 *  - Breaks are inserted in beforeTransform (parsers later replace elements);
 *    each styled element gets its own marker on its <hr> (per element, not per
 *    rule id). In afterTransform a Section Metadata block is inserted after
 *    each marker; the marker of the first section (no real break) is removed.
 *
 * Selectors verified against the live pages (Playwright-rendered) of all
 * template URLs: section elements are `#main > div.section.<block>-container`.
 */
const STYLE_ATTR = 'data-excat-section-style';
const FIRST_ATTR = 'data-excat-section-first';

/**
 * Split `sel` into the base selector and its top-level `:has(X)` /
 * `:not(:has(X))` filters (only used when the DOM lacks native :has()).
 */
function splitHas(sel) {
  const filters = [];
  let base = '';
  let i = 0;
  while (i < sel.length) {
    const rest = sel.slice(i);
    const m = rest.match(/^:not\(\s*:has\(/) || rest.match(/^:has\(/);
    if (m) {
      const negate = m[0].startsWith(':not');
      let depth = 1;
      let j = i + m[0].length;
      const start = j;
      while (j < sel.length && depth > 0) {
        if (sel[j] === '(') depth += 1;
        else if (sel[j] === ')') depth -= 1;
        j += 1;
      }
      const inner = sel.slice(start, j - 1).trim();
      if (negate) {
        // consume the closing paren of :not( ... )
        while (j < sel.length && sel[j] !== ')') j += 1;
        j += 1;
      }
      // A filter applies to the compound selector it is attached to; only the
      // last compound (the matched element) is supported, which is the only
      // form used in page-templates.json.
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
    root.querySelector(':has(*)');
    return true;
  } catch (e) {
    return false;
  }
}

function queryAll(root, sel, hasSupport) {
  if (!sel) return [];
  if (hasSupport || sel.indexOf(':has(') === -1) {
    try {
      return [...root.querySelectorAll(sel)];
    } catch (e) {
      if (sel.indexOf(':has(') === -1) return [];
    }
  }
  // Fallback: emulate trailing :has() / :not(:has()) filters.
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

/** Resolve all rules into [{ el, section }] in document order, deduped. */
function collectSections(root, sections) {
  const hasSupport = supportsHas(root);
  const owner = new Map();
  sections.forEach((section) => {
    const list = Array.isArray(section.selector) ? section.selector : [section.selector];
    list.forEach((sel) => {
      queryAll(root, sel, hasSupport).forEach((el) => {
        if (!owner.has(el)) owner.set(el, section); // first rule wins
      });
    });
  });
  const matched = [...owner.entries()].map(([el, section]) => ({ el, section }));
  matched.sort((a, b) => {
    if (a.el === b.el) return 0;
    // eslint-disable-next-line no-bitwise
    return a.el.compareDocumentPosition(b.el) & 4 ? -1 : 1; // 4 = FOLLOWING
  });
  // Drop elements nested inside another matched section (keep the outer one).
  return matched.filter(({ el }) => !matched.some((o) => o.el !== el && o.el.contains(el)));
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    const matched = collectSections(element, sections);
    // Reverse order: inserting before a later element never shifts earlier ones.
    for (let i = matched.length - 1; i >= 0; i -= 1) {
      const { el, section } = matched[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata
      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(STYLE_ATTR, section.style);
      if (i === 0) hr.setAttribute(FIRST_ATTR, 'true');
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    const markers = [...element.querySelectorAll(`hr[${STYLE_ATTR}]`)];
    for (let i = markers.length - 1; i >= 0; i -= 1) {
      const marker = markers[i];
      const style = marker.getAttribute(STYLE_ATTR);
      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style },
      });
      marker.after(metadataBlock);
      marker.removeAttribute(STYLE_ATTR);
      if (marker.hasAttribute(FIRST_ATTR)) marker.remove(); // first section has no real break
    }
  }
}
