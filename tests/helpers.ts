import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildCatalog } from '../src/data/catalog.ts';
import { parseCsv } from '../src/data/csv.ts';
import type { Catalog } from '../src/data/types.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Učitava stvarni CSV iz projekta i gradi katalog na isti način kao aplikacija. */
export function loadTestCatalog(): Catalog {
  const csvText = readFileSync(
    resolve(projectRoot, 'halal-certificirane-tvrtke-excel.csv'),
    'utf8',
  );
  return buildCatalog(parseCsv(csvText));
}
