# Find Urgent Care Near Me widget analysis

## Task

Create a standalone, interactive urgent-care finder in `widgets/`, using browser geolocation to sort fictional sample clinic listings by distance. Display current open status based on sample weekly schedules and show explicitly simulated sample wait times.

## Requirements and assumptions

- Request location only after the visitor activates “Use my location”; do not access or retain coordinates elsewhere.
- Offer a manual city or ZIP search as a fallback for unsupported, denied, or unavailable geolocation.
- Sort sample clinics by distance from the visitor's device or a recognized sample city/ZIP center.
- Calculate “Open now” from each fictional clinic's weekly local hours and `America/Chicago` time zone.
- Show sample address, distance, open/closed status, today's hours, and a sample wait estimate.
- Clearly disclose that clinics are fictional and wait estimates are simulated, not live operational data; no actual affiliate or clinic data source is connected.
- Use native HTML, CSS, and JavaScript, no runtime dependencies, and a responsive, keyboard-accessible UI.
- Keep all visible copy in a widget copy object for easier localization.

## Acceptance criteria

1. Widget is served at `/widgets/find-urgent-care-near-me/`.
2. Visitors can opt in to geolocation and see matching clinics sorted nearest-first with distances.
3. City/ZIP search works without location permission; invalid locations produce an understandable message and do not silently display misleading matches.
4. Geolocation denied, unavailable, or timed out produces a helpful status and keeps manual search usable.
5. Open/closed status and today's schedule reflect the current time in each clinic's local time zone.
6. Sample wait estimates remain clearly marked as simulated, with no claim of live data.
7. A show-open-only filter updates results; clear/reset restores all clinics for the active location.
8. A live status region communicates result and location changes to assistive technology.
9. Layout is usable at narrow, tablet, and desktop widths; all interactive controls have labels and visible focus.
10. The new widget URL returns HTTP 200, and project lint plus targeted browser interaction checks pass.

## Sample content model

The widget uses a JavaScript array of fictional clinic records, with one record per clinic. Each record provides the clinic name, address, coordinates, local time zone, a weekly hours schedule, and a simulated wait estimate. A second array maps sample city/ZIP values to coordinates for the manual location fallback. User input is not required to render test data.

## Follow-up: NYC listings and listing maps

- Replace Chicago-area sample clinics and search centers with fictional sample listings across Manhattan, Brooklyn, Queens, and the Bronx.
- Include a compact map preview for every listing with a marker at the clinic's sample coordinates.
- Use OpenStreetMap embeds with visible provider attribution and a link to open the full map. These map requests go to OpenStreetMap; they do not represent actual clinic affiliation or validate that a sample address is a real clinic.

### Follow-up acceptance criteria

1. All six sample clinics and supported sample ZIP/city inputs represent New York City.
2. Geolocation/manual location sorting continues to work for NYC sample clinics.
3. Every sample listing contains a labeled, responsive map preview centered on its sample clinic coordinates.
4. Maps identify themselves accessibly, load lazily, and include a full-map link and map attribution.
5. Hours calculations use Eastern time and wait estimates remain clearly labeled as simulated.
6. The existing widget URL remains available; project lint and desktop/mobile browser validation pass without console errors.
