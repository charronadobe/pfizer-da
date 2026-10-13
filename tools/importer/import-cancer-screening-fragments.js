/* eslint-disable */
/* global WebImporter */

/**
 * Imports the popup modals of a page as fragment documents (one per URL).
 * URL format: <page URL>#<popup id>, e.g.
 *   https://www.pfizerforall.com/find-care/cancer-screening/#schedule-breast-screening
 * The cleanup transformer exports every popup as params.fragments ({ path, element })
 * and rewrites the page's links to `/fragments<pagePath>/<id>#_dnb`; this script picks
 * the popup named by the URL hash and returns it as a document at that fragment path.
 */
import cleanupTransformer from './transformers/pfizerforall-cleanup.js';

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const id = new URL(params.originalURL).hash.slice(1);
    if (!id) throw new Error(`No popup id in ${params.originalURL} (expected <page URL>#<popup id>)`);

    cleanupTransformer.call(null, 'beforeTransform', document.body, payload);

    const fragment = (params.fragments || []).find((f) => f.path.endsWith(`/${id}`));
    if (!fragment) throw new Error(`Popup "${id}" not found on ${params.originalURL}`);

    WebImporter.rules.adjustImageUrls(fragment.element, url, params.originalURL);

    return [{
      element: fragment.element,
      path: WebImporter.FileUtils.sanitizePath(fragment.path),
      report: { title: `Fragment: ${id}`, template: 'cancer-screening-fragment', blocks: [] },
    }];
  },
};
