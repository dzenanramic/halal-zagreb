import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { buildCatalog } from '../src/data/catalog.ts';
import { findColumn, parseCsv } from '../src/data/csv.ts';
import { classifyAddress, extractPostalCode } from '../src/data/region.ts';
import { foldText } from '../src/data/text.ts';
import { UNCATEGORIZED_ID, type Catalog } from '../src/data/types.ts';
import { EXPECTED_LOCATIONS, EXPECTED_TOTAL } from '../scripts/expected-locations.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const csvText = readFileSync(resolve(projectRoot, 'halal-certificirane-tvrtke-excel.csv'), 'utf8');
const catalog: Catalog = buildCatalog(parseCsv(csvText));

describe('CSV parser', () => {
  it('čita zaglavlje i retke', () => {
    const document = parseCsv('Naziv,Adresa,Kategorija\n"A","B","C"\n');
    expect(document.header).toEqual(['Naziv', 'Adresa', 'Kategorija']);
    expect(document.records).toHaveLength(1);
    expect(document.records[0]?.values).toEqual(['A', 'B', 'C']);
  });

  it('podržava navodnike, ugniježđene navodnike i višeredne zapise', () => {
    const csv = 'a,b\n"red s, zarezom","red s ""navodnikom"""\n"više\nredaka",x\n';
    const document = parseCsv(csv);
    expect(document.records[0]?.values).toEqual(['red s, zarezom', 'red s "navodnikom"']);
    expect(document.records[1]?.values[0]).toBe('više\nredaka');
  });

  it('zanemaruje prazna polja na kraju i pronalazi stupac bez dijakritike', () => {
    expect(findColumn(['Naziv', 'Adresa', 'Kategorija'], 'kategorija')).toBe(2);
    expect(findColumn(['naziv', 'adresa'], 'Naziv')).toBe(0);
    expect(findColumn(['x'], 'Naziv')).toBe(-1);
  });
});

describe('Klasifikacija područja', () => {
  it('prepoznaje Grad Zagreb iz poštanskog broja i naselja', () => {
    expect(classifyAddress('Radnička cesta 173, 10000, Zagreb, Croatia')).toMatchObject({
      included: true,
      regionId: 'zagreb-city',
    });
    expect(classifyAddress('Prelčeva ul. 46, 10360, Sesvete, Croatia')).toMatchObject({
      included: true,
      regionId: 'zagreb-city',
      place: 'Sesvete',
    });
    expect(classifyAddress('Ive Polite 62, Sesvetski Kraljevec (Zagreb), Croatia')).toMatchObject({
      included: true,
      regionId: 'zagreb-city',
      matchedBy: 'settlement',
    });
  });

  it('prepoznaje Zagrebačku okolicu', () => {
    expect(classifyAddress('Gornji kraj 11, 10430 Samobor, Hrvatska')).toMatchObject({
      included: true,
      regionId: 'zagreb-wider',
      place: 'Samobor',
    });
    expect(classifyAddress('Trešnjevka 24, 10450, Jaska, Croatia')).toMatchObject({
      included: true,
      regionId: 'zagreb-wider',
    });
    expect(classifyAddress('Poljana Čička 87B, 10410 Velika Gorica')).toMatchObject({
      included: true,
      regionId: 'zagreb-wider',
    });
  });

  it('isključuje zapise izvan zagrebačke regije, i kada imena sliče', () => {
    expect(classifyAddress('Ul. Braće Branchetta 42, 51000, Rijeka')).toMatchObject({
      included: false,
      reason: 'outside-zagreb-region',
    });
    expect(classifyAddress('1. Industrijski odvojak 6, 35400, Nova Gradiška, Croatia')).toMatchObject({
      included: false,
    });
    expect(classifyAddress('Ul. Josipa Kraša 3, 49247, Zlatar Bistrica, Croatia')).toMatchObject({
      included: false,
      reason: 'outside-zagreb-region',
    });
    expect(classifyAddress('Put Gaćeleza 1, 22211, Vodice, Hrvatska')).toMatchObject({
      included: false,
    });
  });

  it('čita poštanski broj i kada je zapisan s razmakom', () => {
    expect(extractPostalCode('Ulica Marijana Čavića 1, 10 000, Zagreb')).toBe('10000');
    expect(extractPostalCode('Radnička cesta 20 A, Zagreb, Hrvatska')).toBeNull();
  });
});

describe('Katalog iz stvarnog CSV-a', () => {
  it('sadrži svih 34 obvezne lokacije iz specifikacije', () => {
    const names = new Set(catalog.locations.map((location) => foldText(location.name)));
    const missing = EXPECTED_LOCATIONS.filter((expected) => !names.has(foldText(expected.name)));
    expect(missing.map((entry) => entry.name)).toEqual([]);
    expect(catalog.locations).toHaveLength(EXPECTED_TOTAL);
  });

  it('dijeli lokacije na Grad Zagreb i Zagrebačku okolicu', () => {
    expect(catalog.counts.city).toBe(25);
    expect(catalog.counts.wider).toBe(9);
    expect(catalog.counts.city + catalog.counts.wider).toBe(EXPECTED_TOTAL);
  });

  it('ne uključuje lokacije izvan zagrebačke regije', () => {
    const addresses = catalog.locations.map((location) => foldText(location.address)).join(' | ');
    for (const city of ['rijeka', 'split', 'osijek', 'dubrovnik', 'zadar', 'pula', 'varazdin', 'karlovac']) {
      expect(addresses).not.toContain(city);
    }
    expect(catalog.excluded.length).toBeGreaterThan(0);
  });

  it('kategorije izvodi iz stvarnih vrijednosti i ne izmišlja ih', () => {
    const labels = catalog.categories.map((category) => category.label);
    expect(labels).toContain('Proizvođači');
    expect(labels).toContain('Hotelijeri');
    expect(labels).toContain(null); // zapis bez kategorije (Dr. Škobić d.o.o.)
    for (const category of catalog.categories) {
      if (category.label === null) {
        expect(category.id).toBe(UNCATEGORIZED_ID);
      } else {
        expect(category.count).toBeGreaterThan(0);
      }
    }
  });

  it('označava zapise s nepotpunim podacima bez izmišljanja vrijednosti', () => {
    const incomplete = catalog.locations.filter((location) => location.missingFields.length > 0);
    expect(incomplete.length).toBeGreaterThan(0);
    for (const location of incomplete) {
      if (location.missingFields.includes('category')) {
        expect(location.categoryLabel).toBeNull();
      }
      if (location.missingFields.includes('postalCode')) {
        expect(location.postalCode).toBeNull();
      }
    }
  });

  it('nikada ne dodaje podatke kojih nema u izvoru', () => {
    for (const location of catalog.locations) {
      expect(location.external ?? null).toBeNull();
      expect(JSON.stringify(location)).not.toMatch(/rating|review|stars|openNow|openingHours/i);
    }
  });
});
