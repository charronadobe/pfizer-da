# hero-page

Custom **hero** block. Purpose: content-page-hero.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content.

## Supported variations

| Variation | Option class |
| --- | --- |
| Dropdown (hero with a care-type selector) | `dropdown` |
| Announcement (link strip under the banner image) | `announcement` |

## Universal Editor fields

N/A (Document Authoring project)

## Authoring notes

- **Content:** image, then the h1, then intro paragraph(s), all in one cell (image and text may also sit in separate cells/rows).
- **`announcement`:** add a paragraph that contains only the announcement link right after the image (before the h1). It renders as a full-width strip between the banner image and the text panel. Without the option class the paragraph stays normal content.
- **`dropdown`:** add a second row with an optional label paragraph and a bulleted list; the list item without a link is the button text, every linked item is an option.
- **Breadcrumb:** built automatically from the URL. Set page metadata `Breadcrumb-Title` to override the current page label, or `Breadcrumb` to `off` to hide the breadcrumb on that page.
