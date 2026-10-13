# Find my Doctor widget analysis

## Task

Create a self-contained "Find my Doctor" widget in `widgets/` with fictional sample data. No design reference, live provider directory, or backend was provided.

## Requirements and assumptions

- Treat this as an independently previewable widget rather than an AEM block, because it was requested in the `widgets` folder.
- Include a searchable and filterable list of fictional doctors using sample data only.
- Let visitors search by location, provider name, or specialty and optionally filter by specialty.
- Show helpful provider details and clear contact actions without implying that sample listings are real.
- Keep the widget responsive, keyboard accessible, and usable without third-party services or runtime dependencies.
- Keep UI copy and sample records isolated in the widget files so they can later be replaced or localized.

## Acceptance criteria

1. The widget is accessible at `/widgets/find-my-doctor/` and uses files contained in `widgets/find-my-doctor/`.
2. Search filters providers by location, name, and specialty; the specialty selector narrows those results.
3. Results show provider name, specialty, location, languages, visit options, and a contact action.
4. Empty results and a reset path are available; matching result counts are announced to assistive technology.
5. Controls have programmatic labels and visible focus states, and the layout works on narrow and wide screens.
6. Sample records are clearly fictional and the interface does not imply a connection to a real provider directory.
7. Project lint passes for changed JavaScript, and the local widget URL can be loaded.
