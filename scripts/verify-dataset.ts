/**
 * Provjera podataka: `npm run verify:dataset`
 *
 * Skripta čita CSV iz korijena projekta, provlači ga kroz isti pipeline kao
 * aplikacija (parser -> normalizacija -> klasifikacija područja) i provjerava:
 *   1. učitava li se svih 34 obveznih zagrebačkih lokacija,
 *   2. odgovaraju li nazivi i adrese onima iz CSV-a,
 *   3. je li područje ispravno određeno (Grad Zagreb / Zagrebačka okolica),
 *   4. je li isključen svaki zapis izvan zagrebačke regije.
 *
 * Pokreće se izravno u Nodeu (bez build koraka).
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildCatalog } from '../src/data/catalog.ts';
import { parseCsv } from '../src/data/csv.ts';
import { foldText } from '../src/data/text.ts';
import type { Catalog } from '../src/data/types.ts';
import {
  EXPECTED_LOCATIONS,
  EXPECTED_TOTAL,
  FORBIDDEN_PLACE_TOKENS,
} from './expected-locations.ts';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const csvPath = resolve(projectRoot, 'halal-certificirane-tvrtke-excel.csv');

const failures: string[] = [];
const notes: string[] = [];

function fail(message: string): void {
  failures.push(message);
}

function loadCatalog(): Catalog {
  const csv = readFileSync(csvPath, 'utf8');
  return buildCatalog(parseCsv(csv));
}

function checkExpectedLocations(catalog: Catalog): void {
  const byName = new Map(catalog.locations.map((location) => [foldText(location.name), location]));

  for (const expected of EXPECTED_LOCATIONS) {
    const found = byName.get(foldText(expected.name));
    if (found === undefined) {
      fail(`NEDOSTAJE: "${expected.name}" (${expected.address})`);
      continue;
    }

    if (found.regionId !== expected.region) {
      fail(
        `PODRUČJE: "${found.name}" je klasificiran kao ${found.regionId}, očekivano ${expected.region} (adresa: ${found.address})`,
      );
    }

    if (foldText(found.address) !== foldText(expected.address)) {
      notes.push(
        `ADRESA: "${found.name}" - CSV navodi "${found.address}", specifikacija "${expected.address}" (koristi se vrijednost iz CSV-a)`,
      );
    }
  }

  if (catalog.locations.length !== EXPECTED_TOTAL) {
    fail(
      `BROJ ZAPISA: učitano ${catalog.locations.length}, očekivano ${EXPECTED_TOTAL} obveznih zagrebačkih lokacija`,
    );
  }
}

function checkForbiddenPlaces(catalog: Catalog): void {
  for (const location of catalog.locations) {
    const haystack = foldText(`${location.address} ${location.place}`);
    for (const token of FORBIDDEN_PLACE_TOKENS) {
      if (haystack.includes(foldText(token))) {
        fail(`IZVAN OPSEGA: "${location.name}" (${location.address}) sadrži "${token}"`);
      }
    }
  }
}

function checkDuplicates(catalog: Catalog): void {
  const seen = new Set<string>();
  for (const location of catalog.locations) {
    if (seen.has(location.id)) {
      fail(`DUPLIKAT: identifikator ${location.id} pojavljuje se više puta`);
    }
    seen.add(location.id);
  }
}

function main(): void {
  const catalog = loadCatalog();

  checkExpectedLocations(catalog);
  checkForbiddenPlaces(catalog);
  checkDuplicates(catalog);

  const city = catalog.locations.filter((location) => location.regionId === 'zagreb-city');
  const wider = catalog.locations.filter((location) => location.regionId === 'zagreb-wider');

  console.log('Halal Zagreb - provjera podataka');
  console.log(`Izvor: ${csvPath}`);
  console.log(`Redaka u CSV-u: ${catalog.sourceRows}`);
  console.log('');
  console.log(`Učitano lokacija: ${catalog.locations.length}`);
  console.log(`  Grad Zagreb: ${city.length}`);
  console.log(`  Zagrebačka okolica: ${wider.length}`);
  console.log(`Izvan opsega (isključeno): ${catalog.excluded.length}`);
  console.log(`Bez kategorije: ${catalog.counts.uncategorized}`);
  console.log(`Nepotpuni podaci: ${catalog.counts.incomplete}`);
  console.log('');
  console.log('Kategorije (iz stvarnih vrijednosti u CSV-u):');
  for (const category of catalog.categories) {
    console.log(`  ${category.label ?? '[bez kategorije]'}: ${category.count}`);
  }
  console.log('');
  console.log('Lokacije:');
  for (const location of catalog.locations) {
    const region = location.regionId === 'zagreb-city' ? 'GZ' : 'ZO';
    console.log(
      `  [${region}] ${location.name} | ${location.address} | ${location.categoryLabel ?? '[bez kategorije]'} | ${location.place}`,
    );
  }

  if (notes.length > 0) {
    console.log('');
    console.log('Napomene:');
    for (const note of notes) console.log(`  - ${note}`);
  }

  if (failures.length > 0) {
    console.error('');
    console.error(`GREŠKE (${failures.length}):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log('');
  console.log(`OK: svih ${EXPECTED_TOTAL} obveznih lokacija je učitano i klasificirano kako se očekuje.`);
}

main();
