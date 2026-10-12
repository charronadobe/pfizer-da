/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: pfizerforall.com site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent (OneTrust): <div id="onetrust-consent-sdk"> (line ~1149)
    // Site overlay/dialog host: <div class="core-overlay-host-wrapper block-wrapper"> (line ~1118)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.core-overlay-host-wrapper',
    ]);
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
