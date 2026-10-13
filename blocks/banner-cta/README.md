# banner-cta

Custom **banner** block. Purpose: cta.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content (optional icon, heading, paragraph(s), CTA link — the last link is the CTA).

With `age-input`:
- The CTA becomes an inline age field. The submit button (CTA text) only appears once a valid age (18–105) is entered; submitting opens the CTA link with `?age=<value>` (new tab for off-site links).
- A short paragraph directly above the CTA, after the description, renders as a small note (e.g. "Get results in under 2 min.").
- Optional row 2: field label | query parameter name (default `age`).
- Clear-button label: placeholders key `Clear input`.

## Supported variations

| Variation | Option class |
| --- | --- |
| Gradient (gradient background panel) | `gradient` |
| Age input (inline age field with CTA) | `age-input` |

## Universal Editor fields

N/A (Document Authoring project)
