import { clinics, sampleLocations } from './clinics.js';

const copy = {
  title: 'Find Urgent Care Near Me',
  introduction: 'See nearby sample clinics, today’s hours, and estimated wait times.',
  demoNotice: 'Demo only: NYC clinics and map pins are sample listings; wait times are simulated, not live. No clinic network or live operations feed is connected.',
  locationLabel: 'City or ZIP code',
  locationPlaceholder: 'Try New York City, NY or 10001',
  searchButton: 'Search location',
  useLocationButton: 'Use my location',
  resetButton: 'Reset search',
  openOnlyLabel: 'Show open clinics only',
  resultHeading: 'Nearby sample clinics',
  resultSingular: 'sample clinic',
  resultPlural: 'sample clinics',
  emptyHeading: 'No clinics match these filters',
  emptyMessage: 'Try another sample city or ZIP code, or turn off the open-clinics filter.',
  invalidLocation: 'That location is not in this sample directory. Try New York City, Chelsea, Midtown Manhattan, Harlem, Brooklyn Heights, Astoria, South Bronx, or a listed ZIP code.',
  initialStatus: 'Showing sample clinics near New York City, NY. Enter a city or ZIP code, or share your location to sort clinics by distance.',
  unsupportedLocation: 'Location access is not available in this browser. Search by a sample city or ZIP code instead.',
  deniedLocation: 'Location permission was denied. Allow location access in your browser settings, or search by a sample city or ZIP code.',
  unavailableLocation: 'Your location could not be determined. Check your device location settings, or search by a sample city or ZIP code.',
  timeoutLocation: 'Location lookup took too long. Try again, or search by a sample city or ZIP code.',
  unknownLocationError: 'Something went wrong while getting your location. Search by a sample city or ZIP code instead.',
  locating: 'Finding nearby sample clinics…',
  locationSuccess: 'Showing sample clinics closest to your location.',
  searchSuccess: 'Showing sample clinics near',
  locationHeading: 'Choose a location',
  openStatus: 'Open now',
  closedStatus: 'Closed now',
  openLabel: 'Status',
  addressLabel: 'Address',
  distanceLabel: 'Distance',
  hoursLabel: 'Today’s hours',
  waitLabel: 'Sample wait',
  minutes: 'min',
  miles: 'mi',
  closedToday: 'Closed today',
  missingHours: 'Hours unavailable',
  noWait: 'Unavailable',
  mapLink: 'Open larger map',
  mapAttribution: 'Map data © OpenStreetMap contributors',
};

const weekdayKeys = {
  Sun: 'sun',
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
};

const normalize = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const createElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};

function distanceBetween(origin, destination) {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const latitudeDifference = radians(destination.latitude - origin.latitude);
  const longitudeDifference = radians(destination.longitude - origin.longitude);
  const originLatitude = radians(origin.latitude);
  const destinationLatitude = radians(destination.latitude);
  const haversine = (Math.sin(latitudeDifference / 2) ** 2)
    + (Math.cos(originLatitude) * Math.cos(destinationLatitude)
      * (Math.sin(longitudeDifference / 2) ** 2));

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function localClinicTime(clinic, date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: clinic.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return {
    weekday: weekdayKeys[values.weekday],
    minutes: (Number(values.hour) * 60) + Number(values.minute),
  };
}

function formatClockTime(clockTime) {
  const [hour, minute] = clockTime.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = (hour % 12) || 12;

  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

function clinicHoursForToday(clinic, date) {
  const { weekday } = localClinicTime(clinic, date);
  const hours = clinic.hours[weekday];

  return hours
    ? `${formatClockTime(hours[0])}–${formatClockTime(hours[1])}`
    : copy.closedToday;
}

function isClinicOpen(clinic, date) {
  const { weekday, minutes } = localClinicTime(clinic, date);
  const hours = clinic.hours[weekday];
  if (!hours) return false;

  const openMinutes = Number(hours[0].slice(0, 2)) * 60 + Number(hours[0].slice(3));
  const closeMinutes = Number(hours[1].slice(0, 2)) * 60 + Number(hours[1].slice(3));

  return minutes >= openMinutes && minutes < closeMinutes;
}

function findSampleLocation(query) {
  const normalizedQuery = normalize(query);

  return sampleLocations.find((location) => (
    normalize(location.name) === normalizedQuery
    || normalize(location.name.split(',')[0]) === normalizedQuery
    || location.postalCodes.includes(normalizedQuery)
  ));
}

function createDetail(label, value) {
  const detail = createElement('div', 'urgent-care-detail');
  detail.append(
    createElement('dt', 'urgent-care-detail-label', label),
    createElement('dd', 'urgent-care-detail-value', value),
  );

  return detail;
}

function createClinicMap(clinic) {
  const latitudeDelta = 0.006;
  const longitudeDelta = 0.009;
  const mapParameters = new URLSearchParams({
    bbox: [
      clinic.longitude - longitudeDelta,
      clinic.latitude - latitudeDelta,
      clinic.longitude + longitudeDelta,
      clinic.latitude + latitudeDelta,
    ].join(','),
    layer: 'mapnik',
    marker: `${clinic.latitude},${clinic.longitude}`,
  });
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?${mapParameters}`;
  const figure = createElement('figure', 'urgent-care-map');
  const mapFrame = createElement('iframe', 'urgent-care-map-frame');
  mapFrame.src = mapUrl;
  mapFrame.title = `${clinic.name} area map`;
  mapFrame.loading = 'lazy';
  mapFrame.referrerPolicy = 'no-referrer';
  mapFrame.setAttribute('allowfullscreen', '');

  const caption = createElement('figcaption', 'urgent-care-map-caption');
  const mapLink = createElement('a', 'urgent-care-map-link', copy.mapLink);
  mapLink.href = `https://www.openstreetmap.org/?mlat=${clinic.latitude}&mlon=${clinic.longitude}#map=16/${clinic.latitude}/${clinic.longitude}`;
  mapLink.target = '_blank';
  mapLink.rel = 'noopener noreferrer';
  mapLink.append(document.createTextNode(' (opens in new tab)'));
  const attribution = createElement('span', 'urgent-care-map-attribution', copy.mapAttribution);
  caption.append(mapLink, attribution);
  figure.append(mapFrame, caption);

  return figure;
}

function createClinicCard(clinic, origin, date) {
  const card = createElement('li', 'urgent-care-card');
  const clinicHeading = createElement('h3', 'urgent-care-clinic-name', clinic.name);
  const isOpen = isClinicOpen(clinic, date);
  const status = createElement(
    'p',
    `urgent-care-open-status${isOpen ? ' is-open' : ' is-closed'}`,
    isOpen ? copy.openStatus : copy.closedStatus,
  );
  const details = createElement('dl', 'urgent-care-details');
  const distance = `${distanceBetween(origin, clinic).toFixed(1)} ${copy.miles}`;
  const todayHours = clinicHoursForToday(clinic, date);
  const wait = Number.isFinite(clinic.sampleWaitMinutes)
    ? `${clinic.sampleWaitMinutes} ${copy.minutes} (simulated)`
    : copy.noWait;

  details.append(
    createDetail(copy.addressLabel, clinic.address),
    createDetail(copy.distanceLabel, distance),
    createDetail(copy.hoursLabel, todayHours),
    createDetail(copy.waitLabel, wait),
  );
  card.append(clinicHeading, status, createClinicMap(clinic), details);

  return card;
}

function initializeWidget(widget) {
  const headingId = `${widget.id}-heading`;
  const locationHeadingId = `${widget.id}-location-heading`;
  const resultsHeadingId = `${widget.id}-results-heading`;
  const defaultLocation = sampleLocations[0];
  let activeLocation = defaultLocation;
  let openOnly = false;

  const heading = createElement('h1', 'urgent-care-title', copy.title);
  heading.id = headingId;
  const introduction = createElement('p', 'urgent-care-intro', copy.introduction);
  const demoNotice = createElement('p', 'urgent-care-demo-notice', copy.demoNotice);

  const locationSection = createElement('section', 'urgent-care-location');
  locationSection.setAttribute('aria-labelledby', locationHeadingId);
  const locationHeading = createElement('h2', 'urgent-care-section-heading', copy.locationHeading);
  locationHeading.id = locationHeadingId;

  const locationForm = createElement('form', 'urgent-care-location-form');
  locationForm.setAttribute('role', 'search');
  locationForm.setAttribute('aria-labelledby', locationHeadingId);
  const locationField = createElement('div', 'urgent-care-location-field');
  const locationLabel = createElement('label', '', copy.locationLabel);
  const locationInput = createElement('input', 'urgent-care-location-input');
  locationInput.type = 'search';
  locationInput.name = 'location';
  locationInput.placeholder = copy.locationPlaceholder;
  locationInput.autocomplete = 'off';
  locationInput.value = defaultLocation.name;
  locationInput.id = `${widget.id}-location`;
  locationLabel.htmlFor = locationInput.id;
  locationField.append(locationLabel, locationInput);

  const locationActions = createElement('div', 'urgent-care-location-actions');
  const searchButton = createElement('button', 'urgent-care-button urgent-care-search-button', copy.searchButton);
  searchButton.type = 'submit';
  const geolocationButton = createElement('button', 'urgent-care-button urgent-care-geolocation-button', copy.useLocationButton);
  geolocationButton.type = 'button';
  const resetButton = createElement('button', 'urgent-care-button urgent-care-reset-button', copy.resetButton);
  resetButton.type = 'reset';
  locationActions.append(searchButton, geolocationButton, resetButton);
  locationForm.append(locationField, locationActions);
  locationSection.append(locationHeading, locationForm);

  const locationStatus = createElement('p', 'urgent-care-location-status', copy.initialStatus);
  locationStatus.setAttribute('role', 'status');
  locationStatus.setAttribute('aria-live', 'polite');
  locationStatus.setAttribute('aria-atomic', 'true');

  const filterLabel = createElement('label', 'urgent-care-open-filter');
  const filterInput = createElement('input', 'urgent-care-open-filter-input');
  filterInput.type = 'checkbox';
  filterInput.name = 'open-only';
  filterLabel.append(filterInput, createElement('span', '', copy.openOnlyLabel));

  const resultsSection = createElement('section', 'urgent-care-results');
  resultsSection.setAttribute('aria-labelledby', resultsHeadingId);
  const resultsHeading = createElement('h2', 'urgent-care-section-heading', copy.resultHeading);
  resultsHeading.id = resultsHeadingId;
  const resultCount = createElement('p', 'urgent-care-result-count');
  resultCount.setAttribute('aria-live', 'polite');
  resultCount.setAttribute('aria-atomic', 'true');
  const clinicList = createElement('ul', 'urgent-care-clinic-list');
  resultsSection.append(resultsHeading, resultCount, clinicList);

  const renderClinics = () => {
    const now = new Date();
    const nearbyClinics = clinics
      .map((clinic) => ({
        clinic,
        distance: distanceBetween(activeLocation, clinic),
      }))
      .sort((first, second) => first.distance - second.distance)
      .filter(({ clinic }) => !openOnly || isClinicOpen(clinic, now));

    resultCount.textContent = `${nearbyClinics.length} ${nearbyClinics.length === 1
      ? copy.resultSingular
      : copy.resultPlural}`;
    clinicList.replaceChildren();

    if (nearbyClinics.length) {
      clinicList.append(...nearbyClinics.map(({ clinic }) => createClinicCard(clinic, activeLocation, now)));
      return;
    }

    const emptyState = createElement('li', 'urgent-care-empty-state');
    emptyState.append(
      createElement('h3', '', copy.emptyHeading),
      createElement('p', '', copy.emptyMessage),
    );
    clinicList.append(emptyState);
  };

  locationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const location = findSampleLocation(locationInput.value);
    if (!location) {
      locationStatus.textContent = copy.invalidLocation;
      return;
    }

    activeLocation = location;
    locationStatus.textContent = `${copy.searchSuccess} ${location.name}.`;
    renderClinics();
  });

  geolocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
      locationStatus.textContent = copy.unsupportedLocation;
      return;
    }

    geolocationButton.disabled = true;
    locationStatus.textContent = copy.locating;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        activeLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        locationStatus.textContent = copy.locationSuccess;
        geolocationButton.disabled = false;
        renderClinics();
      },
      (error) => {
        const messages = {
          1: copy.deniedLocation,
          2: copy.unavailableLocation,
          3: copy.timeoutLocation,
        };
        locationStatus.textContent = messages[error.code] || copy.unknownLocationError;
        geolocationButton.disabled = false;
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300000,
        timeout: 12000,
      },
    );
  });

  filterInput.addEventListener('change', () => {
    openOnly = filterInput.checked;
    renderClinics();
  });

  locationForm.addEventListener('reset', (event) => {
    event.preventDefault();
    activeLocation = defaultLocation;
    openOnly = false;
    filterInput.checked = false;
    locationInput.value = defaultLocation.name;
    locationStatus.textContent = copy.initialStatus;
    geolocationButton.disabled = false;
    renderClinics();
    locationInput.focus();
  });

  widget.replaceChildren(
    heading,
    introduction,
    demoNotice,
    locationSection,
    locationStatus,
    filterLabel,
    resultsSection,
  );
  renderClinics();
}

const widget = document.querySelector('.urgent-care-widget');
if (widget) initializeWidget(widget);
