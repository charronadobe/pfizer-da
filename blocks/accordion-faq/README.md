# accordion-faq

Custom **accordion** block. Purpose: faq.

## Authoring (Document Authoring)

Model: `standalone`

One row per item, two cells: **question** | **answer**. The answer can hold
paragraphs, lists, inline links and CTA links (a link alone in its own
paragraph).

- One CTA in an answer renders as a small outlined button.
- Two or more CTAs render as stacked underlined text links; off-site links get
  an external-link glyph.

Place the section heading (e.g. "Frequently asked questions") as default
content directly before the block in the same section. On desktop (>= 900px)
the heading sits in a left column beside the questions; on mobile it stacks
above them.

Items are native `<details>`/`<summary>` disclosures; several may be open at
once.

## Supported variations

| Variation | Authoring | Look |
|-----------|-----------|------|
| (default) | `Accordion FAQ` | Divider lines between items; an open item becomes a tinted rounded card; chevron toggle. |
| `card` | `Accordion FAQ (card)` | Every item is a tinted rounded card (8px apart) with a larger question and a circular plus/minus toggle. Used for "What does it cost?" on /find-care/cancer-screening/. |

## Universal Editor fields

N/A (Document Authoring project)
