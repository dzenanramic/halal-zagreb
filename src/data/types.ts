/**
 * Tipovi podatkovnog sloja.
 *
 * Pravilo projekta: nijedno polje u ovim tipovima ne smije se popunjavati
 * izmišljenim vrijednostima. Ako vrijednost ne postoji u CSV izvoru, polje je
 * `null` (ili prazan string za sirovi zapis) i u sučelju se prikazuje oznaka
 * "Nije navedeno" / "Podatak nije dostupan".
 */

/** Područja filtriranja. */
export type RegionId = 'zagreb-city' | 'zagreb-wider';

/** Vrijednost filtra područja, uključujući "sve". */
export type RegionFilter = RegionId | 'all';

/** Interni identifikator za zapise bez kategorije u izvoru. */
export const UNCATEGORIZED_ID = 'uncategorized';

/** Vrijednost filtra kategorije, uključujući "sve". */
export const ALL_CATEGORIES = 'all';

/** Polja koja u CSV izvoru mogu nedostajati. */
export type MissingField = 'category' | 'postalCode' | 'country';

/** Sirovi zapis pročitan iz CSV-a, bez interpretacije. */
export interface SourceRecord {
  /** Naziv tvrtke/lokacije, točno kako stoji u izvoru (samo sažeti razmaci). */
  name: string;
  /** Puna adresa, točno kako stoji u izvoru. */
  address: string;
  /** Sirova vrijednost kategorije; prazan string kada u izvoru nije navedena. */
  category: string;
  /** Redni broj retka u CSV datoteci (1 = zaglavlje). */
  sourceLine: number;
}

/** Razlog izbacivanja zapisa iz zagrebačkog skupa. */
export type ExclusionReason =
  | 'outside-zagreb-region'
  | 'unknown-region'
  | 'missing-address';

/** Zapis izvan Zagreba i Zagrebačke okolice - zadržan samo za reviziju. */
export interface ExcludedRecord extends SourceRecord {
  reason: ExclusionReason;
  /** Kratko objašnjenje odluke (adresa i poštanski broj iz izvora). */
  detail: string;
}

/**
 * Podaci koje CSV izvor ove verzije ne sadrži, ali ih budući izvori mogu
 * donijeti. Dok su polja prazna, sučelje prikazuje oznaku "Podatak nije
 * dostupan" i ne nudi radnje koje ne vode nikamo.
 */
export interface LocationExtendedInfo {
  phone?: string | null;
  website?: string | null;
  openingHours?: string | null;
  coordinates?: { latitude: number; longitude: number } | null;
}

/** Normalizirana lokacija unutar Zagreba i Zagrebačke okolice. */
export interface Location {
  /** Stabilan identifikator izveden iz naziva i retka u izvoru. */
  id: string;
  name: string;
  address: string;
  /** Mjesto/naselje izvedeno iz adrese (npr. Sesvete, Samobor). */
  place: string;
  regionId: RegionId;
  /** Način na koji je područje određeno - bitno za reviziju klasifikacije. */
  regionMatchedBy: 'postal-code' | 'settlement';
  /** Identifikator kategorije ili UNCATEGORIZED_ID. */
  categoryId: string;
  /** Sirova vrijednost kategorije iz CSV-a ili null kada nije navedena. */
  categoryLabel: string | null;
  postalCode: string | null;
  country: string | null;
  /** Polja koja u izvoru nedostaju; koristi se za oznaku nepotpunih podataka. */
  missingFields: MissingField[];
  /** Dodatni podaci izvan CSV izvora (trenutačno uvijek nedostupni). */
  external?: LocationExtendedInfo | null;
  /** Unaprijed izračunat tekst za pretragu (bez dijakritike). */
  search: { name: string; address: string; place: string };
  sourceLine: number;
  /** Redoslijed iz izvora - koristi se kao zadnji kriterij sortiranja. */
  order: number;
}

/** Sažetak kategorije za filtar. */
export interface CategorySummary {
  id: string;
  /** Sirova vrijednost iz izvora ili null za zapise bez kategorije. */
  label: string | null;
  count: number;
}

/** Sažetak područja za filtar. */
export interface RegionSummary {
  id: RegionId;
  count: number;
}

/** Učitan i normaliziran katalog. */
export interface Catalog {
  locations: Location[];
  /** Zapisi iz CSV-a koji nisu u Zagrebu ni Zagrebačkoj okolici. */
  excluded: ExcludedRecord[];
  categories: CategorySummary[];
  regions: RegionSummary[];
  counts: {
    total: number;
    city: number;
    wider: number;
    uncategorized: number;
    incomplete: number;
  };
  /** Ukupan broj podatkovnih redaka u CSV-u (bez zaglavlja). */
  sourceRows: number;
}

export type SortKey = 'relevance' | 'name' | 'place';

/** Stanje pretrage i filtera. */
export interface QueryState {
  query: string;
  region: RegionFilter;
  /** ALL_CATEGORIES ili identifikator kategorije. */
  category: string;
  sort: SortKey;
}

/** Kodovi grešaka pri učitavanju podataka. */
export type DatasetErrorCode =
  | 'fetch-failed'
  | 'empty-source'
  | 'missing-columns'
  | 'no-zagreb-records'
  | 'unknown';

export interface DatasetErrorInfo {
  code: DatasetErrorCode;
  /** Poruka za razvojnog programera (ne prikazuje se kao glavna poruka korisniku). */
  message: string;
}
