# cards-carousel

Custom **cards** block. Purpose: condition-link-carousel.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content.

## Supported variations

No variations. Section context: in a `light-blue` section (Section Metadata `style: light-blue`) the tiles turn white and SVG icons switch to core blue.

## Behavior

- SVG icons are drawn as a CSS mask, so they follow the tile's icon colour (`currentColor`).
- The track bleeds to both viewport edges while the first tile lines up with the content column.
- There is one progress bar per scroll position. Past 5 positions the idle bars shrink to dots. The prev/next arrow fades out at either end.
- A short paragraph directly above the section's intro `h2` is styled as an eyebrow (14px/20px). The intro is capped at 845px on desktop and sits 40px above the tiles.

## Universal Editor fields

N/A (Document Authoring project)
