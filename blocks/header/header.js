/*
 * Header block – floating pill bar with hover megamenus, search drawer and relief-mode flyout;
 * below 1200px a full-width bar with a slide-in, multi-level menu.
 * All copy, links and images come from the nav fragment (nav.plain.html):
 *   section 1: logos (default, relief)            section 2: main menu (ul > li: label, title, items)
 *   section 3: search (icon, link, quick links)   section 4: relief mode (icon, label, title, text, Off/On, note)
 *   section 5: mobile menu (open icon, close icon, back-label prefix, main-menu name)
 */

const DESKTOP = window.matchMedia('(width >= 1200px)');
const THEME_KEY = 'demo-theme';
const CLOSE_DELAY = 150;

let panelId = 0;

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.filter(Boolean));
  return node;
}

/** Fetch the nav fragment: /content first (local preview), then the site root (DA/EDS). */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
  // fragment image paths are relative to the fragment, not the current page
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return [...doc.body.children].filter((c) => c.tagName === 'DIV');
}

function isExternal(a) {
  try {
    return new URL(a.href, window.location.href).host !== window.location.host;
  } catch (e) {
    return false;
  }
}

function decorateLink(a, className) {
  a.className = className;
  if (isExternal(a)) {
    a.classList.add('is-external');
    a.append(el('span', 'header-icon header-icon-external'));
  }
  return a;
}

/** Item link. Plain HTML wraps it in a paragraph; some items use a direct <a>. */
function directLink(li) {
  return li.querySelector(':scope > a, :scope > p > a');
}

function nestedList(li) {
  return li.querySelector(':scope > ul');
}

/* --- panel item classification (generic, data driven) --- */
function isPromo(li) {
  const sub = nestedList(li);
  return !!(directLink(li) && sub && !sub.querySelector('a'));
}

function isColumn(li) {
  const sub = nestedList(li);
  return !!(sub && sub.querySelector('a'));
}

/** column links; emphasised (<em>) "about" links are mobile-only */
function columnLinks(li, includeMobileOnly) {
  return [...nestedList(li).children]
    .filter((c) => includeMobileOnly || !c.querySelector(':scope > em'))
    .map((c) => c.querySelector('a'))
    .filter(Boolean);
}

function buildPromo(li) {
  const link = directLink(li);
  const img = li.querySelector('img');
  const card = el('div', `header-promo${img ? ' header-promo-image' : ' header-promo-core'}`);
  if (img) {
    img.className = 'header-promo-bg';
    img.loading = 'lazy';
    card.append(img);
  }
  const content = el('div', 'header-promo-content');
  const items = [...nestedList(li).children];
  const badges = items.filter((i) => !i.querySelector('em'));
  const meta = items.find((i) => i.querySelector('em'));
  // badges + title are grouped like the source card (badge/text container)
  const text = el('div', 'header-promo-text');
  if (badges.length) {
    const list = el('ul', 'header-promo-badges');
    badges.forEach((b) => list.append(el('li', 'header-promo-badge', b.textContent.trim())));
    text.append(list);
  }
  text.append(el('p', 'header-promo-title', link.textContent.trim()));
  content.append(text);
  if (meta) content.append(el('p', 'header-promo-meta', meta.textContent.trim()));
  const arrow = el('a', 'header-promo-link', el('span', 'header-icon header-icon-arrow'));
  arrow.href = link.href;
  arrow.setAttribute('aria-label', link.textContent.trim());
  content.append(arrow);
  card.append(content);
  return card;
}

function buildColumn(li) {
  const col = el('div', 'header-panel-column');
  const heading = directLink(li);
  if (heading) col.append(decorateLink(heading, 'header-panel-heading'));
  columnLinks(li, false).forEach((a) => col.append(decorateLink(a, 'header-panel-link')));
  return col;
}

/**
 * Build a megamenu panel from a menu <li>: first <p> is the trigger label,
 * second <p> the panel title; nested <ul> holds links, link columns and promo cards.
 */
function buildPanel(title, items) {
  const panel = el('div', 'header-panel');
  panel.id = `header-panel-${panelId += 1}`;
  const titleEl = el('p', 'header-panel-title', title);
  const promos = items.filter(isPromo).map(buildPromo);
  const columns = items.filter((li) => !isPromo(li) && isColumn(li)).map(buildColumn);
  const links = items.filter((li) => !isPromo(li) && !isColumn(li) && directLink(li))
    .map((li) => directLink(li));

  if (columns.length) {
    // multi-level: title + promo on the left, link columns on the right
    panel.classList.add('header-panel-columns');
    const grid = el('div', 'header-panel-grid', ...columns);
    // standalone links join the last column as featured links
    links.forEach((a) => columns[columns.length - 1].append(decorateLink(a, 'header-panel-heading header-panel-featured')));
    panel.append(el('div', 'header-panel-side', titleEl, ...promos), grid);
  } else {
    panel.classList.add('header-panel-list');
    const list = el('div', 'header-panel-links', ...links.map((a) => decorateLink(a, 'header-panel-link')));
    // promos sit in a featured column that spans the panel height (as on the source)
    const featured = promos.length ? el('div', 'header-panel-featured', ...promos) : null;
    panel.append(...[titleEl, list, featured].filter(Boolean));
  }
  return panel;
}

function iconButton(img, className) {
  const btn = el('button', className);
  btn.type = 'button';
  btn.setAttribute('aria-label', img.alt);
  img.alt = '';
  img.className = 'header-tool-icon';
  btn.append(img);
  return btn;
}

function buildSearch(section) {
  const [iconP, linkP] = section.querySelectorAll(':scope > p');
  const img = iconP?.querySelector('img');
  const link = linkP?.querySelector('a');
  if (!img || !link) return null;
  const label = img.alt;
  const button = iconButton(img, 'header-tool header-search-toggle');

  const drawer = el('div', 'header-drawer header-search-drawer');
  drawer.id = `header-panel-${panelId += 1}`;
  const form = el('form', 'header-search-form');
  form.setAttribute('role', 'search');
  form.action = link.href;
  form.method = 'get';
  const input = el('input', 'header-search-input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = link.textContent.trim();
  input.setAttribute('aria-label', label);
  input.autocomplete = 'off';
  const submit = el('button', 'header-search-submit', el('span', 'header-icon header-icon-chevron'));
  submit.type = 'submit';
  submit.setAttribute('aria-label', label);
  form.append(input, submit);
  drawer.append(form);

  const heading = section.querySelector(':scope > h3');
  const list = section.querySelector(':scope > ul');
  if (heading || list) {
    const quick = el('div', 'header-search-quick');
    if (heading) quick.append(el('p', 'header-search-quick-title', heading.textContent.trim()));
    [...(list?.children || [])].forEach((li) => {
      const a = li.querySelector('a');
      if (!a) return;
      const icon = li.querySelector('img');
      const item = el('a', 'header-search-quick-link');
      item.href = a.href;
      if (icon) {
        icon.alt = '';
        item.append(el('span', 'header-search-quick-icon', icon));
      }
      item.append(el('span', 'header-search-quick-label', a.textContent.trim()));
      if (isExternal(a)) item.append(el('span', 'header-icon header-icon-external'));
      quick.append(item);
    });
    drawer.append(quick);
  }
  const notes = [...section.querySelectorAll(':scope > p')].slice(2);
  notes.forEach((p) => drawer.append(el('p', 'header-search-disclaimer', p.textContent.trim())));
  return { button, drawer, input };
}

function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/**
 * Relief mode section: icon, optional menu label (before the heading), heading,
 * description (after the heading), Off/On list, optional note (after the list).
 */
function buildRelief(section) {
  const img = section.querySelector(':scope > p img');
  if (!img) return null;
  const heading = section.querySelector(':scope > h3');
  const states = section.querySelector(':scope > ul');
  const paras = [...section.querySelectorAll(':scope > p')].filter((p) => !p.querySelector('img'));
  const before = (node, ref) => !!(ref && (node.compareDocumentPosition(ref) & Node.DOCUMENT_POSITION_FOLLOWING));
  const menuLabel = paras.find((p) => before(p, heading))?.textContent.trim() || '';
  const desc = paras.find((p) => !before(p, heading) && (!states || before(p, states)))?.textContent.trim() || '';
  const note = states ? paras.find((p) => !before(p, states))?.textContent.trim() || '' : '';
  const icon = img.cloneNode();
  const button = iconButton(img, 'header-tool header-relief-toggle');
  const title = heading?.textContent.trim() || button.getAttribute('aria-label');
  const [offLabel, onLabel] = [...(states?.children || [])].map((li) => li.textContent.trim());

  // a relief row (text + Off/On switch); every instance stays in sync with the theme
  const makeControls = () => {
    const state = el('span', 'header-relief-state');
    const toggle = el('button', 'header-relief-switch', el('span', 'header-relief-thumb'));
    toggle.type = 'button';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-label', title);
    const sync = () => {
      const on = currentTheme() === 'dark';
      toggle.setAttribute('aria-checked', String(on));
      state.textContent = (on ? onLabel : offLabel) || '';
    };
    toggle.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage unavailable */ }
      window.dispatchEvent(new CustomEvent('aem-theme-change', { detail: { theme: next } }));
    });
    window.addEventListener('aem-theme-change', () => setTimeout(sync));
    sync();
    return [
      el('div', 'header-relief-text', el('p', 'header-relief-title', title), desc ? el('p', 'header-relief-desc', desc) : null),
      el('div', 'header-relief-controls', state, toggle),
    ];
  };

  const flyout = el('div', 'header-drawer header-relief-flyout');
  flyout.id = `header-panel-${panelId += 1}`;
  flyout.setAttribute('role', 'dialog');
  flyout.setAttribute('aria-label', title);
  flyout.append(...makeControls());
  return {
    button, flyout, icon, menuLabel, note, makeControls,
  };
}

/* --- mobile slide-in menu --- */
function chevron() {
  return el('span', 'header-icon header-icon-chevron');
}

/**
 * Build the mobile menu views from a pristine copy of the menu section.
 * L1: menu items; L2: section links (+ drill rows for headed columns, promo cards);
 * L3: headed column links (mobile-only "about" link first).
 */
function buildMobileMenu({
  menu, logo, closeImg, backPrefix, mainName, relief,
}) {
  const drawer = el('div', 'header-mobile');
  drawer.id = `header-panel-${panelId += 1}`;
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  // the menu views form a navigation landmark inside the dialog
  const navEl = el('nav', 'header-mobile-nav');
  if (mainName) navEl.setAttribute('aria-label', mainName);
  drawer.append(navEl);
  const views = [];
  const closeButtons = [];
  let show = () => {};

  const closeButton = () => {
    const img = closeImg.cloneNode();
    const btn = iconButton(img, 'header-tool header-mobile-close');
    btn.setAttribute('aria-label', closeImg.alt);
    closeButtons.push(btn);
    return btn;
  };
  // views follow the nav-panel convention: data-depth + nav-panel-active / nav-panel-hidden state
  const makeView = (title, parent) => {
    const view = el('div', 'header-mobile-view nav-panel nav-panel-hidden');
    view.dataset.depth = parent ? String(Number(parent.view.dataset.depth) + 1) : '0';
    const top = el('div', 'header-mobile-top');
    if (parent) {
      const back = el('button', 'header-mobile-back', el('span', 'header-icon header-icon-back'));
      back.type = 'button';
      back.setAttribute('aria-label', `${backPrefix} ${parent.title}`.trim());
      back.addEventListener('click', () => show(parent.view, view.opener));
      top.append(back, el('p', 'header-mobile-panel-title', el('span', '', title)));
    } else {
      top.append(logo);
    }
    top.append(closeButton());
    view.append(top);
    navEl.append(view);
    views.push(view);
    return { view, body: view, title };
  };
  const drillButton = (label, target, className) => {
    const btn = el('button', className, el('span', 'header-mobile-label', label), chevron());
    btn.type = 'button';
    btn.addEventListener('click', () => {
      target.view.opener = btn;
      show(target.view);
    });
    return btn;
  };
  const mobileLink = (a, className) => {
    const link = a.cloneNode(true);
    return decorateLink(link, className);
  };

  const root = makeView(mainName);
  const settings = relief?.menuLabel ? makeView(relief.menuLabel, root) : null;
  const settingsRow = () => {
    if (!settings) return null;
    const icon = relief.icon.cloneNode();
    icon.alt = '';
    icon.className = 'header-tool-icon';
    const btn = drillButton(relief.menuLabel, settings, 'header-mobile-settings');
    btn.prepend(icon);
    return btn;
  };

  const l1 = el('ul', 'header-mobile-list header-mobile-l1');
  [...menu.querySelectorAll(':scope > ul > li')].forEach((li) => {
    const label = li.querySelector(':scope > p')?.textContent.trim() || '';
    const items = [...(nestedList(li)?.children || [])];
    if (!items.length) {
      const a = li.querySelector('a');
      if (a) l1.append(el('li', '', mobileLink(a, 'header-mobile-link')));
      return;
    }
    const l2 = makeView(label, root);
    const list = el('ul', 'header-mobile-list header-mobile-l2');
    const promos = [];
    items.forEach((item) => {
      if (isPromo(item)) {
        promos.push(buildPromo(item.cloneNode(true)));
      } else if (isColumn(item) && directLink(item)) {
        const heading = directLink(item).textContent.trim();
        const l3 = makeView(heading, l2);
        const l3list = el('ul', 'header-mobile-list header-mobile-l3');
        columnLinks(item, true).forEach((a) => l3list.append(el('li', '', mobileLink(a, 'header-mobile-link'))));
        l3.body.append(...[l3list, settingsRow()].filter(Boolean));
        list.append(el('li', '', drillButton(heading, l3, 'header-mobile-drill')));
      } else if (isColumn(item)) {
        columnLinks(item, true).forEach((a) => list.append(el('li', '', mobileLink(a, 'header-mobile-link'))));
      } else if (directLink(item)) {
        list.append(el('li', '', mobileLink(directLink(item), 'header-mobile-link')));
      }
    });
    l2.body.append(...[list, settingsRow(), ...promos].filter(Boolean));
    l1.append(el('li', '', drillButton(label, l2, 'header-mobile-drill header-mobile-l1-item')));
  });
  root.body.append(...[l1, settingsRow()].filter(Boolean));

  if (settings) {
    settings.body.append(el('div', 'header-mobile-relief', ...relief.makeControls()));
    if (relief.note) settings.body.append(el('p', 'header-mobile-note', relief.note));
  }

  show = (view, focusTarget) => {
    views.forEach((v) => {
      v.classList.toggle('nav-panel-active', v === view);
      v.classList.toggle('nav-panel-hidden', v !== view);
    });
    drawer.scrollTop = 0;
    (focusTarget || view.querySelector('.header-mobile-back, a, button'))?.focus({ preventScroll: true });
  };
  return {
    drawer, root: root.view, closeButtons, show,
  };
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const sections = await fetchNav();
  block.textContent = '';
  if (!sections) return;
  const [brand, menu, search, relief, mobile] = sections;
  // the desktop build moves fragment nodes; the mobile menu reads a pristine copy
  const menuCopy = menu?.cloneNode(true);

  const wrapper = el('div', 'header-wrapper-inner');
  const bar = el('div', 'header-bar');
  const nav = el('nav', 'header-nav');

  // logos: default + relief (dark). Pictures may be bare or wrapped in a link.
  const logo = el('a', 'header-logo');
  const logoImages = [...(brand?.querySelectorAll('img') || [])];
  const logoLink = brand?.querySelector('a');
  if (logoLink) logo.href = logoLink.href;
  else if (logoImages.length) logo.href = '/';
  if (logoLink && !logoImages.length) logo.textContent = logoLink.textContent.trim();
  logoImages.forEach((img, i) => {
    img.className = `header-logo-img${i ? ' header-logo-relief' : ' header-logo-default'}`;
    img.loading = i ? 'lazy' : 'eager';
    if (i) img.alt = '';
    logo.append(img);
  });
  const mobileLogo = logo.cloneNode(true);

  /* --- open/close state --- */
  const scrim = el('div', 'header-scrim');
  let openItem = null;
  let closeTimer = null;

  const setOpen = (item, open) => {
    if (!item) return;
    item.trigger.setAttribute('aria-expanded', String(open));
    item.panel.classList.toggle('is-open', open);
  };
  const close = (returnFocus = false) => {
    clearTimeout(closeTimer);
    if (!openItem) return;
    const { trigger } = openItem;
    setOpen(openItem, false);
    openItem = null;
    block.classList.remove('is-open', 'has-scrim');
    document.body.style.overflow = '';
    if (returnFocus) trigger.focus();
  };
  const open = (item) => {
    clearTimeout(closeTimer);
    if (openItem === item) return;
    if (openItem) setOpen(openItem, false);
    openItem = item;
    setOpen(item, true);
    block.classList.add('is-open');
    block.classList.toggle('has-scrim', !!item.scrim);
    // full-screen panels on mobile lock the page behind them
    if (!DESKTOP.matches && item.lockScroll) document.body.style.overflow = 'hidden';
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      // keep a panel open while someone is typing in it
      if (openItem?.panel.contains(document.activeElement) && document.activeElement.matches('input')) return;
      close();
    }, CLOSE_DELAY);
  };
  // desktop: hover opens, leaving every host schedules a close
  const bindHover = (item, ...hosts) => hosts.forEach((host) => {
    host.addEventListener('mouseenter', () => { if (DESKTOP.matches) open(item); });
    host.addEventListener('mouseleave', () => { if (DESKTOP.matches && openItem === item) scheduleClose(); });
  });
  // hover already opened the panel on desktop, so a click keeps it open (as on the source)
  const bindClick = (item, onOpen) => item.trigger.addEventListener('click', () => {
    if (openItem === item && !DESKTOP.matches) close();
    else {
      open(item);
      onOpen?.();
    }
  });

  // main menu
  const list = el('ul', 'header-menu');
  [...(menu?.querySelectorAll(':scope > ul > li') || [])].forEach((li) => {
    const [labelP, titleP] = li.querySelectorAll(':scope > p');
    const label = labelP?.textContent.trim() || '';
    const items = [...(nestedList(li)?.children || [])];
    const entry = el('li', 'header-menu-item');
    if (!items.length) {
      const a = li.querySelector('a');
      if (a) entry.append(decorateLink(a, 'header-menu-link'));
      list.append(entry);
      return;
    }
    const trigger = el('button', 'header-menu-trigger', label);
    trigger.type = 'button';
    trigger.setAttribute('aria-expanded', 'false');
    const panel = buildPanel(titleP?.textContent.trim() || label, items);
    trigger.setAttribute('aria-controls', panel.id);
    const item = { trigger, panel, scrim: true };
    bindClick(item);
    bindHover(item, entry);
    entry.append(trigger, panel);
    list.append(entry);
  });
  nav.append(logo, list);

  // tools: search + relief mode (+ mobile menu button)
  const tools = el('div', 'header-tools');
  const drawers = [];
  const searchParts = search ? buildSearch(search) : null;
  const reliefParts = relief ? buildRelief(relief) : null;
  const [menuImg, closeImg] = [...(mobile?.querySelectorAll(':scope > p img') || [])];
  const [backPrefix, mainName] = [...(mobile?.querySelectorAll(':scope > p') || [])]
    .filter((p) => !p.querySelector('img')).map((p) => p.textContent.trim());

  if (searchParts) {
    const item = {
      trigger: searchParts.button, panel: searchParts.drawer, scrim: true, lockScroll: true,
    };
    searchParts.button.setAttribute('aria-expanded', 'false');
    searchParts.button.setAttribute('aria-controls', searchParts.drawer.id);
    // focus once the drawer has become visible
    bindClick(item, () => requestAnimationFrame(() => searchParts.input.focus()));
    const wrap = el('div', 'header-tool-wrap', searchParts.button);
    bindHover(item, wrap, searchParts.drawer);
    tools.append(wrap);
    if (closeImg) {
      // full-screen search on mobile closes from its own corner button
      const closeBtn = iconButton(closeImg.cloneNode(), 'header-tool header-search-close');
      closeBtn.setAttribute('aria-label', closeImg.alt);
      closeBtn.addEventListener('click', () => close(true));
      searchParts.drawer.prepend(closeBtn);
    }
    drawers.push(searchParts.drawer);
  }
  if (reliefParts) {
    const item = { trigger: reliefParts.button, panel: reliefParts.flyout, scrim: false };
    reliefParts.button.setAttribute('aria-expanded', 'false');
    reliefParts.button.setAttribute('aria-controls', reliefParts.flyout.id);
    bindClick(item);
    const wrap = el('div', 'header-tool-wrap header-relief-wrap', reliefParts.button, reliefParts.flyout);
    bindHover(item, wrap);
    tools.append(wrap);
  }
  if (menuImg && closeImg && menuCopy) {
    const mobileMenu = buildMobileMenu({
      menu: menuCopy, logo: mobileLogo, closeImg, backPrefix: backPrefix || '', mainName: mainName || '', relief: reliefParts,
    });
    const hamburger = iconButton(menuImg, 'header-tool header-hamburger');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-controls', mobileMenu.drawer.id);
    const item = {
      trigger: hamburger, panel: mobileMenu.drawer, scrim: false, lockScroll: true,
    };
    hamburger.addEventListener('click', () => {
      open(item);
      mobileMenu.show(mobileMenu.root);
    });
    mobileMenu.closeButtons.forEach((btn) => btn.addEventListener('click', () => close(true)));
    tools.append(el('div', 'header-tool-wrap header-menu-toggle-wrap', hamburger));
    drawers.push(mobileMenu.drawer);
  }
  nav.append(tools);
  bar.append(nav);
  wrapper.append(bar, ...drawers);
  block.append(wrapper, scrim);

  // dismiss: scrim, outside click, Escape
  scrim.addEventListener('click', () => close());
  document.addEventListener('click', (e) => {
    if (openItem && !block.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openItem) close(true);
  });

  // hide on scroll down, reveal on scroll up
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const hide = y > lastY && y > block.offsetHeight && !openItem;
    block.classList.toggle('is-hidden', hide);
    lastY = y;
  }, { passive: true });

  // crossing the desktop breakpoint resets any open panel or mobile menu
  DESKTOP.addEventListener('change', () => close());
}
