# columns-media

Custom **columns** block. Purpose: promo-split (source: pfizerforall.com `image-1-2` and `image-1-1`).

## Authoring (Document Authoring)

Model: `standalone`

Single block table, one row with two cells:

- **Image cell** – a single image. The cell order is kept on desktop: put the image first for image-left,
  last for image-right. The image always shows first on mobile.
- **Text cell** – optional eyebrow paragraph (directly above the heading), heading, body paragraphs,
  optional small print (a paragraph that is entirely italic), and one or more CTA links (each in its own paragraph).

Animated GIFs keep their own proportions; photos are cropped to 1:1 (mobile) and 4:3 (desktop).
External images (absolute URLs from another origin) are used as authored; same-origin images go through
`createOptimizedPicture`.

## Supported variations

| Option | Source | Effect |
|---|---|---|
| (none) | `image-1-2` | Rounded image (max 628px) next to text (max 548px), within the content grid. |
| `full-bleed` | `image-1-1` | 50/50 split: the image runs to the page edge (square outer corners up to 1440px), full-width square image on mobile. |
| `italic` | `italic-text` | Small print stays italic (e.g. "Source: CDC"). |

Put the block in a section with `style: light-blue` for the light blue (core-lighter) surface; text turns dark blue.

## Universal Editor fields

N/A (Document Authoring project)
