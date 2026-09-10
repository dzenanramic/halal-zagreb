/**
 * Izgradnja kataloga iz CSV dokumenta.
 *
 * Koraci:
 *  1. provjera zaglavlja (Naziv, Adresa, Kategorija),
 *  2. normalizacija zapisa (samo sažimanje bjelina - sadržaj se ne mijenja),
 *  3. klasifikacija područja iz adrese,
 *  4. zadržavanje isključivo zapisa iz Grada Zagreba i Zagrebačke okolice,
 *  5. sažeci kategorija i područja za filtre.
 */

import { findColumn, type CsvDocument } from './csv.ts';
import { DatasetError } from './errors.ts';
import { classifyAddress } from './region.ts';
import { collapseWhitespace, foldText, slugify } from './text.ts';
import {
  UNCATEGORIZED_ID,
  type Catalog,
  type CategorySummary,
  type ExcludedRecord,
  type Location,
  type MissingField,
  type SourceRecord,
} from './types.ts';

const NAME_COLUMN = 'Naziv';
const ADDRESS_COLUMN = 'Adresa';
const CATEGORY_COLUMN = 'Kategorija';

function readCell(values: string[], index: number): string {
  if (index < 0) return '';
  return collapseWhitespace(values[index] ?? '');
}

function toSourceRecord(values: string[], line: number, columns: Record<string, number>): SourceRecord {
  return {
    name: readCell(values, columns.name ?? -1),
    address: readCell(values, columns.address ?? -1),
    category: readCell(values, columns.category ?? -1),
    sourceLine: line,
  };
}

/**
 * Polja koja se broje u oznaku "Nepotpuni podaci".
 *
 * Namjerno se prate samo kategorija i poštanski broj: to su podaci koji
 * korisniku mijenjaju odgovor na pitanje "gdje je i što je ovo". Država se
 * ne broji jer je cijeli prikazani skup u Hrvatskoj, a područje se ionako
 * određuje iz adrese. U detaljima se ipak jasno vidi i status države.
 */
function collectMissingFields(record: {
  category: string;
  postalCode: string | null;
}): MissingField[] {
  const missing: MissingField[] = [];
  if (record.category === '') missing.push('category');
  if (record.postalCode === null) missing.push('postalCode');
  return missing;
}

/** Sortira kategorije abecedno, a "bez kategorije" uvijek na kraj. */
function compareCategories(left: CategorySummary, right: CategorySummary): number {
  if (left.label === null) return 1;
  if (right.label === null) return -1;
  return left.label.localeCompare(right.label, 'hr');
}

/** Gradi katalog iz parsiranog CSV dokumenta. */
export function buildCatalog(document: CsvDocument): Catalog {
  if (document.header.length === 0 || document.records.length === 0) {
    throw new DatasetError('empty-source', 'CSV izvor je prazan ili nema podatkovnih redaka.');
  }

  const columns: Record<string, number> = {
    name: findColumn(document.header, NAME_COLUMN),
    address: findColumn(document.header, ADDRESS_COLUMN),
    category: findColumn(document.header, CATEGORY_COLUMN),
  };

  if (columns.name === -1 || columns.address === -1) {
    throw new DatasetError(
      'missing-columns',
      `CSV zaglavlje mora sadržavati stupce "${NAME_COLUMN}" i "${ADDRESS_COLUMN}". Pronađeno: ${document.header.join(', ')}`,
    );
  }

  const locations: Location[] = [];
  const excluded: ExcludedRecord[] = [];
  let order = 0;

  for (const record of document.records) {
    const source = toSourceRecord(record.values, record.line, columns);

    if (source.name === '' && source.address === '') {
      continue;
    }

    if (source.address === '') {
      excluded.push({
        ...source,
        reason: 'missing-address',
        detail: 'Zapis u izvoru nema adresu pa se područje ne može odrediti.',
      });
      continue;
    }

    const classification = classifyAddress(source.address);

    if (!classification.included) {
      excluded.push({
        ...source,
        reason: classification.reason,
        detail: classification.detail,
      });
      continue;
    }

    const hasCategory = source.category !== '';
    const categoryId = hasCategory ? slugify(source.category) : UNCATEGORIZED_ID;
    const place = classification.place;

    locations.push({
      id: `${slugify(source.name) || 'lokacija'}-${source.sourceLine}`,
      name: source.name,
      address: source.address,
      place,
      regionId: classification.regionId,
      regionMatchedBy: classification.matchedBy,
      categoryId,
      categoryLabel: hasCategory ? source.category : null,
      postalCode: classification.postalCode,
      country: classification.country,
      missingFields: collectMissingFields({
        category: source.category,
        postalCode: classification.postalCode,
      }),
      search: {
        name: foldText(source.name),
        address: foldText(source.address),
        place: foldText(place),
      },
      sourceLine: source.sourceLine,
      order,
    });

    order += 1;
  }

  if (locations.length === 0) {
    throw new DatasetError(
      'no-zagreb-records',
      'Nijedan zapis iz izvora nije prepoznat kao lokacija u Zagrebu ili Zagrebačkoj okolici.',
    );
  }

  const categoryCounts = new Map<string, CategorySummary>();
  for (const location of locations) {
    const existing = categoryCounts.get(location.categoryId);
    if (existing === undefined) {
      categoryCounts.set(location.categoryId, {
        id: location.categoryId,
        label: location.categoryLabel,
        count: 1,
      });
    } else {
      existing.count += 1;
    }
  }

  const categories = [...categoryCounts.values()].sort(compareCategories);
  const city = locations.filter((location) => location.regionId === 'zagreb-city').length;
  const wider = locations.filter((location) => location.regionId === 'zagreb-wider').length;

  return {
    locations,
    excluded,
    categories,
    regions: [
      { id: 'zagreb-city', count: city },
      { id: 'zagreb-wider', count: wider },
    ],
    counts: {
      total: locations.length,
      city,
      wider,
      uncategorized: locations.filter((location) => location.categoryId === UNCATEGORIZED_ID).length,
      incomplete: locations.filter((location) => location.missingFields.length > 0).length,
    },
    sourceRows: document.records.length,
  };
}
