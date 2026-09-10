/**
 * Centralizirani prijevodi.
 *
 * Pravila:
 *  - svi korisnički tekstovi žive ovdje, nigdje drugdje u komponentama,
 *  - nazivi tvrtki i adrese iz registra se NE prevode,
 *  - nazivi kategorija se prevode jer su to oznake, ne nazivi tvrtki,
 *  - prijevod ne smije tvrditi ništa što izvor ne sadrži (nema ocjena,
 *    radnog vremena, telefona, koordinata, broja korisnika).
 */

export type Language = "hr" | "en";

export const LANGUAGES: Language[] = ["hr", "en"];

export interface PluralForms {
  one: string;
  /** Koristi se u hrvatskom za 2-4 (npr. "2 rezultata"). */
  few?: string;
  other: string;
}

export type TranslationValue = string | PluralForms;

const hr = {
  "app.name": "Halal Zagreb",
  "app.tagline": "Katalog halal lokacija",
  "app.skipToContent": "Preskoči na sadržaj",

  "nav.locations": "Lokacije",
  "nav.about": "O projektu",
  "nav.menu": "Izbornik",
  "nav.closeMenu": "Zatvori izbornik",
  "nav.home": "Halal Zagreb - početna stranica",
  "nav.language": "Jezik",

  "intro.eyebrow": "Katalog · Grad Zagreb i okolica",
  "intro.title": "Halal-certificirane lokacije u Zagrebu i okolici",
  "intro.note":
    "Podaci potječu iz dostupnog registra halal-certificiranih tvrtki.",
  "stats.total": "Ukupno lokacija",
  "stats.city": "Grad Zagreb",
  "stats.wider": "Zagrebačka okolica",

  "locations.title": "Lokacije u Zagrebu i okolici",
  "locations.results": {
    one: "{count} rezultat",
    few: "{count} rezultata",
    other: "{count} rezultata",
  },
  "locations.listHeading": "Popis lokacija",
  "locations.sortLabel": "Sortiranje",
  "locations.sortRelevance": "Relevantnost",
  "locations.sortName": "Naziv (A-Ž)",
  "locations.sortPlace": "Mjesto",
  "locations.sortHintRelevance":
    "Bez upita zadržava se redoslijed iz registra.",

  "filters.title": "Filteri",
  "filters.region": "Područje",
  "filters.regionHint":
    "Područje se određuje iz adrese i poštanskog broja u registru.",
  "filters.regionAll": "Sve lokacije",
  "filters.regionCity": "Grad Zagreb",
  "filters.regionWider": "Zagrebačka okolica",
  "filters.category": "Kategorija",
  "filters.categoryAll": "Sve kategorije",
  "filters.categoryMissing": "Kategorija nije navedena",
  "filters.active": "Aktivni filteri",
  "filters.clearAll": "Ukloni sve filtere",
  "filters.remove": "Ukloni filter: {label}",
  "filters.showResults": "Prikaži rezultate",
  "filters.close": "Zatvori filtre",
  "filters.open": "Filteri",
  "filters.openWithCount": "Filteri ({count})",

  "card.details": "Detalji",
  "card.incomplete": "Nepotpuni podaci",
  "card.incompleteHint": "U registru nije navedeno: {fields}.",
  "card.openDetails": "Otvori detalje za {name}",

  "details.title": "Detalji lokacije",
  "details.close": "Zatvori detalje",
  "details.closeHint": "Zatvori (Esc)",
  "details.sectionRecord": "Podaci iz registra",
  "details.sectionAvailability": "Status podataka",
  "details.fieldName": "Naziv",
  "details.fieldAddress": "Adresa",
  "details.fieldCategory": "Kategorija",
  "details.fieldRegion": "Područje",
  "details.fieldPlace": "Mjesto",
  "details.fieldPostalCode": "Poštanski broj",
  "details.fieldCountry": "Država",
  "details.fieldPhone": "Telefon",
  "details.fieldWebsite": "Web-stranica",
  "details.fieldHours": "Radno vrijeme",
  "details.notSpecified": "Nije navedeno",
  "details.notAvailable": "Podatak nije dostupan",
  "details.copyAddress": "Kopiraj adresu",
  "details.copied": "Adresa je kopirana.",
  "details.copyFailed": "Kopiranje nije uspjelo.",
  "details.openInMaps": "Otvori u kartama",
  "details.call": "Nazovi",
  "details.visitWebsite": "Posjeti web-stranicu",
  "details.notFoundTitle": "Lokacija nije pronađena.",
  "details.notFoundBody":
    "Zapis s tim identifikatorom ne postoji u učitanom katalogu.",
  "details.back": "Natrag na popis lokacija",

  "state.loading": "Učitavanje lokacija…",
  "state.loadingHint": "Čitam i provjeravam zapise iz registra.",
  "state.errorTitle": "Podatke trenutačno nije moguće učitati.",
  "state.errorBody":
    "Izvor podataka nije dostupan ili nije u očekivanom formatu (Naziv, Adresa, Kategorija).",
  "state.errorEmpty": "Datoteka s podacima je prazna.",
  "state.errorColumns": "Datoteka s podacima nema očekivane stupce.",
  "state.errorNoRecords": "U datoteci nema zapisa za Zagreb i okolicu.",
  "state.retry": "Pokušaj ponovno",
  "state.errorDetails": "Tehnički detalji",
  "state.errorCode": "Kod greške: {code}",
  "state.emptyTitle": "Nema rezultata za odabrane filtere.",
  "state.emptyBody": "Uklonite pojedini filter ili odaberite drugo područje.",

  "about.eyebrow": "Izvor i opseg",
  "about.title": "O projektu",
  "about.p1":
    "Halal Zagreb je početni katalog halal-certificiranih lokacija u Zagrebu i okolici. Prikazuje zapise iz dostupnog registra halal-certificiranih tvrtki.",
  "about.p2":
    "Podaci ovise o dostupnom registru. Aplikacija ne provjerava stanje na terenu i ne tvrdi da je neka lokacija otvorena ili trenutačno aktivna ako to nije navedeno u izvoru.",
  "about.p3":
    "Neki zapisi imaju nepotpunu adresu, kategoriju ili druge informacije. Takva polja su označena kao „Nije navedeno” ili „Podatak nije dostupan”.",
  "about.p4":
    "Karta i dodatne funkcionalnosti mogu biti dodane u budućim verzijama. Ova verzija ne prikazuje kartu, ocjene, recenzije, broj korisnika ni radno vrijeme.",
  "about.scopeTitle": "Opseg ove verzije",
  "about.scopeRegion":
    "Prikazano: {total} lokacija - {city} u Gradu Zagrebu i {wider} u Zagrebačkoj okolici.",
  "about.scopeExcluded":
    "Izvan opsega: {count} zapisa izvan Grada Zagreba i Zagrebačke okolice.",
  "about.scopeMethod":
    "Područje se određuje iz adrese i poštanskog broja u izvoru, a ne prema sličnosti naziva.",

  "footer.sourceNote":
    "Podaci: registar halal-certificiranih tvrtki. Aplikacija ne dodaje podatke kojih nema u izvoru.",
  "footer.navigation": "Navigacija",
  "footer.language": "Jezik",
  "footer.disclaimer":
    "Katalog je informativan. Prije posjeta provjerite podatke u izvoru ili kod tvrtke.",

  "region.city": "Grad Zagreb",
  "region.wider": "Zagrebačka okolica",
  "missing.category": "kategorija",
  "missing.postalCode": "poštanski broj",
  "missing.country": "država",
} satisfies Record<string, TranslationValue>;

export type TranslationKey = keyof typeof hr;

const en: Record<TranslationKey, TranslationValue> = {
  "app.name": "Halal Zagreb",
  "app.tagline": "Halal locations directory",
  "app.skipToContent": "Skip to content",

  "nav.locations": "Locations",
  "nav.about": "About",
  "nav.menu": "Menu",
  "nav.closeMenu": "Close menu",
  "nav.home": "Halal Zagreb - home page",
  "nav.language": "Language",

  "intro.eyebrow": "Directory · City of Zagreb and surroundings",
  "intro.title": "Halal-certified places in Zagreb and nearby areas",
  "intro.note":
    "The data comes from the available register of halal-certified companies. Fields missing in the source are marked, not filled with estimates.",
  "stats.total": "Total locations",
  "stats.city": "City of Zagreb",
  "stats.wider": "Wider Zagreb area",

  "locations.title": "Locations in Zagreb and nearby areas",
  "locations.results": {
    one: "{count} result",
    other: "{count} results",
  },
  "locations.listHeading": "Location list",
  "locations.sortLabel": "Sort",
  "locations.sortRelevance": "Relevance",
  "locations.sortName": "Name (A-Z)",
  "locations.sortPlace": "Place",
  "locations.sortHintRelevance": "Without a query, the register order is kept.",

  "filters.title": "Filters",
  "filters.region": "Area",
  "filters.regionHint":
    "The area is derived from the address and postal code in the register.",
  "filters.regionAll": "All locations",
  "filters.regionCity": "City of Zagreb",
  "filters.regionWider": "Wider Zagreb area",
  "filters.category": "Category",
  "filters.categoryAll": "All categories",
  "filters.categoryMissing": "Category not specified",
  "filters.active": "Active filters",
  "filters.clearAll": "Clear all filters",
  "filters.remove": "Remove filter: {label}",
  "filters.showResults": "Show results",
  "filters.close": "Close filters",
  "filters.open": "Filters",
  "filters.openWithCount": "Filters ({count})",

  "card.details": "Details",
  "card.incomplete": "Incomplete data",
  "card.incompleteHint": "Not specified in the register: {fields}.",
  "card.openDetails": "Open details for {name}",

  "details.title": "Location details",
  "details.close": "Close details",
  "details.closeHint": "Close (Esc)",
  "details.sectionRecord": "Register record",
  "details.sectionAvailability": "Data status",
  "details.fieldName": "Name",
  "details.fieldAddress": "Address",
  "details.fieldCategory": "Category",
  "details.fieldRegion": "Area",
  "details.fieldPlace": "Place",
  "details.fieldPostalCode": "Postal code",
  "details.fieldCountry": "Country",
  "details.fieldPhone": "Phone",
  "details.fieldWebsite": "Website",
  "details.fieldHours": "Opening hours",
  "details.notSpecified": "Not specified",
  "details.notAvailable": "Not available",
  "details.copyAddress": "Copy address",
  "details.copied": "Address copied.",
  "details.copyFailed": "Copying failed.",
  "details.openInMaps": "Open in maps",
  "details.call": "Call",
  "details.visitWebsite": "Visit website",
  "details.notFoundTitle": "Location not found.",
  "details.notFoundBody":
    "No record with that identifier exists in the loaded directory.",
  "details.back": "Back to the location list",

  "state.loading": "Loading locations…",
  "state.loadingHint": "Reading and validating register records.",
  "state.errorTitle": "Data cannot be loaded right now.",
  "state.errorBody":
    "The data source is unavailable or not in the expected format (Name, Address, Category).",
  "state.errorEmpty": "The data file is empty.",
  "state.errorColumns": "The data file does not contain the expected columns.",
  "state.errorNoRecords":
    "The file contains no records for Zagreb and its surroundings.",
  "state.retry": "Try again",
  "state.errorDetails": "Technical details",
  "state.errorCode": "Error code: {code}",
  "state.emptyTitle": "No results for the selected filters.",
  "state.emptyBody": "Remove a single filter or choose another area.",

  "about.eyebrow": "Source and scope",
  "about.title": "About",
  "about.p1":
    "Halal Zagreb is an initial directory of halal-certified locations in Zagreb and nearby areas. It lists records from the available register of halal-certified companies.",
  "about.p2":
    "The data depends on the available register. The app does not verify conditions on site and does not claim that a location is open or currently active unless the source states it.",
  "about.p3":
    "Some records have an incomplete address, category or other information. Such fields are marked as “Not specified” or “Not available”.",
  "about.p4":
    "A map and additional features may be added in future versions. This version shows no map, ratings, reviews, user counts or opening hours.",
  "about.scopeTitle": "Scope of this version",
  "about.scopeRegion":
    "Displayed: {total} locations - {city} in the City of Zagreb and {wider} in the wider Zagreb area.",
  "about.scopeExcluded":
    "Out of scope: {count} records outside the City of Zagreb and the wider Zagreb area.",
  "about.scopeMethod":
    "The area is derived from the address and postal code in the source, not from name similarity.",

  "footer.sourceNote":
    "Data: register of halal-certified companies. The app adds no data that is not in the source.",
  "footer.navigation": "Navigation",
  "footer.language": "Language",
  "footer.disclaimer":
    "This directory is informational. Verify the details at the source or with the company before visiting.",

  "region.city": "City of Zagreb",
  "region.wider": "Wider Zagreb area",
  "missing.category": "category",
  "missing.postalCode": "postal code",
  "missing.country": "country",
};

/**
 * Nazivi kategorija iz registra na engleskom. Hrvatski koristi izvorne
 * vrijednosti iz registra, pa je ovo samo prijevod oznaka - ne i tvrdnja o
 * postojanju kategorija kojih u izvoru nema.
 */
const CATEGORY_NAMES_EN: Record<string, string> = {
  Proizvođači: "Manufacturers",
  Trgovina: "Retail",
  Hotelijeri: "Hotels",
  "Restorani i catering": "Restaurants and catering",
  Klaonice: "Slaughterhouses",
  "Turističke agencije": "Travel agencies",
  "Školske ustanove": "Schools",
  OPG: "Family farms (OPG)",
  "Zdravstvene ustanove i SPA": "Health facilities and spa",
};

export const translations: Record<
  Language,
  Record<TranslationKey, TranslationValue>
> = {
  hr,
  en,
};

/** Vraća naziv kategorije na traženom jeziku; nepoznate vrijednosti ostaju izvorne. */
export function translateCategoryLabel(
  label: string,
  language: Language,
): string {
  if (language === "en") {
    return CATEGORY_NAMES_EN[label] ?? label;
  }
  return label;
}
