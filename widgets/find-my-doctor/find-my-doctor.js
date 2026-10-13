import { doctors } from './doctors.js';

const copy = {
  title: 'Find my Doctor',
  introduction: 'Search our sample directory by location, doctor, or specialty.',
  sampleNotice: 'Sample experience only. These doctors and contact details are fictional.',
  locationLabel: 'City, ZIP code, doctor, or specialty',
  locationPlaceholder: 'Try Chicago or cardiology',
  specialtyLabel: 'Specialty',
  allSpecialties: 'All specialties',
  searchButton: 'Search',
  resetButton: 'Clear filters',
  resultsHeading: 'Doctors in the sample directory',
  resultSingular: 'sample doctor found',
  resultPlural: 'sample doctors found',
  emptyHeading: 'No doctors found',
  emptyMessage: 'Try another location or specialty.',
  locationPrefix: 'Location',
  postalCodePrefix: 'ZIP',
  languagePrefix: 'Languages',
  visitOptionsPrefix: 'Visit options',
  phoneAction: 'Call sample office',
  searchRegion: 'Find a doctor',
  resultsRegion: 'Doctor search results',
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

function matchesDoctor(doctor, query, specialty) {
  const matchesSpecialty = !specialty || doctor.specialty === specialty;
  const searchableText = [
    doctor.name,
    doctor.specialty,
    doctor.city,
    doctor.state,
    doctor.postalCode,
  ].join(' ');

  return matchesSpecialty && (!query || normalize(searchableText).includes(query));
}

function createProviderCard(doctor) {
  const card = createElement('li', 'doctor-card');
  const heading = createElement('h3', 'doctor-card-name', doctor.name);
  const specialty = createElement('p', 'doctor-card-specialty', doctor.specialty);
  const location = createElement('p', 'doctor-card-detail');
  const locationLabel = createElement('span', 'doctor-card-label', `${copy.locationPrefix}: `);
  location.append(locationLabel, document.createTextNode(`${doctor.city}, ${doctor.state} `));
  const postalCode = createElement('span', 'doctor-card-postal', `(${copy.postalCodePrefix} ${doctor.postalCode})`);
  location.append(postalCode);

  const languages = createElement('p', 'doctor-card-detail');
  languages.append(
    createElement('span', 'doctor-card-label', `${copy.languagePrefix}: `),
    document.createTextNode(doctor.languages.join(', ')),
  );

  const visits = createElement('p', 'doctor-card-detail');
  visits.append(
    createElement('span', 'doctor-card-label', `${copy.visitOptionsPrefix}: `),
    document.createTextNode(doctor.visitTypes.join(', ')),
  );

  const contact = createElement('a', 'doctor-card-contact', copy.phoneAction);
  contact.href = `tel:${doctor.phone.replace(/[^\d+]/g, '')}`;
  contact.setAttribute('aria-label', `${copy.phoneAction} ${doctor.name}, ${doctor.phone}`);

  card.append(heading, specialty, location, languages, visits, contact);
  return card;
}

function initializeWidget(widget) {
  const headingId = `${widget.id}-heading`;
  const resultsHeadingId = `${widget.id}-results-heading`;
  const heading = createElement('h1', 'doctor-widget-title', copy.title);
  heading.id = headingId;

  const introduction = createElement('p', 'doctor-widget-intro', copy.introduction);
  const sampleNotice = createElement('p', 'doctor-widget-notice', copy.sampleNotice);

  const form = createElement('form', 'doctor-search-form');
  form.setAttribute('role', 'search');
  form.setAttribute('aria-labelledby', headingId);

  const queryField = createElement('div', 'doctor-search-field');
  const queryLabel = createElement('label', '', copy.locationLabel);
  const queryInput = createElement('input', 'doctor-search-input');
  queryInput.type = 'search';
  queryInput.name = 'query';
  queryInput.placeholder = copy.locationPlaceholder;
  queryInput.autocomplete = 'off';
  queryLabel.htmlFor = `${widget.id}-query`;
  queryInput.id = queryLabel.htmlFor;
  queryField.append(queryLabel, queryInput);

  const specialtyField = createElement('div', 'doctor-search-field');
  const specialtyLabel = createElement('label', '', copy.specialtyLabel);
  const specialtySelect = createElement('select', 'doctor-specialty-select');
  specialtySelect.name = 'specialty';
  specialtyLabel.htmlFor = `${widget.id}-specialty`;
  specialtySelect.id = specialtyLabel.htmlFor;

  const allSpecialties = createElement('option', '', copy.allSpecialties);
  allSpecialties.value = '';
  specialtySelect.append(allSpecialties);
  [...new Set(doctors.map((doctor) => doctor.specialty))]
    .sort()
    .forEach((specialty) => {
      const option = createElement('option', '', specialty);
      option.value = specialty;
      specialtySelect.append(option);
    });
  specialtyField.append(specialtyLabel, specialtySelect);

  const actions = createElement('div', 'doctor-search-actions');
  const searchButton = createElement('button', 'doctor-search-submit', copy.searchButton);
  searchButton.type = 'submit';
  const resetButton = createElement('button', 'doctor-search-reset', copy.resetButton);
  resetButton.type = 'reset';
  actions.append(searchButton, resetButton);
  form.append(queryField, specialtyField, actions);

  const resultsSection = createElement('section', 'doctor-results');
  resultsSection.setAttribute('aria-labelledby', resultsHeadingId);
  const resultsHeading = createElement('h2', 'doctor-results-heading', copy.resultsHeading);
  resultsHeading.id = resultsHeadingId;
  const resultsCount = createElement('p', 'doctor-results-count');
  resultsCount.setAttribute('role', 'status');
  resultsCount.setAttribute('aria-live', 'polite');
  resultsCount.setAttribute('aria-atomic', 'true');
  const resultsList = createElement('ul', 'doctor-results-list');
  resultsSection.append(resultsHeading, resultsCount, resultsList);

  const renderResults = () => {
    const query = normalize(queryInput.value);
    const specialty = specialtySelect.value;
    const filteredDoctors = doctors.filter((doctor) => matchesDoctor(doctor, query, specialty));

    resultsCount.textContent = `${filteredDoctors.length} ${filteredDoctors.length === 1
      ? copy.resultSingular
      : copy.resultPlural}`;
    resultsList.replaceChildren();

    if (filteredDoctors.length) {
      resultsList.append(...filteredDoctors.map(createProviderCard));
      return;
    }

    const emptyState = createElement('li', 'doctor-empty-state');
    emptyState.append(
      createElement('h3', '', copy.emptyHeading),
      createElement('p', '', copy.emptyMessage),
    );
    resultsList.append(emptyState);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderResults();
  });
  queryInput.addEventListener('input', renderResults);
  specialtySelect.addEventListener('change', renderResults);
  form.addEventListener('reset', (event) => {
    event.preventDefault();
    queryInput.value = '';
    specialtySelect.value = '';
    renderResults();
    queryInput.focus();
  });

  widget.replaceChildren(
    heading,
    introduction,
    sampleNotice,
    form,
    resultsSection,
  );
  renderResults();
}

const widget = document.querySelector('.find-my-doctor-widget');
if (widget) initializeWidget(widget);
