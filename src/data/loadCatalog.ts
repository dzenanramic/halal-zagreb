/**
 * Učitavanje kataloga.
 *
 * Ova verzija čita CSV koji je isporučen uz aplikaciju. Ako je postavljena
 * varijabla okoline `VITE_HALAL_DATA_URL`, podaci se dohvaćaju s udaljenog
 * izvora istog formata (Naziv, Adresa, Kategorija). UI sloj ne zna odakle
 * podaci dolaze - dobiva samo `Catalog` ili `DatasetError`.
 *
 * Datoteka je jedini modul u `src/data` koji zavisi od Vitea (`?raw` uvoz),
 * pa se ostali moduli mogu pokretati i iz Node skripte za provjeru podataka.
 */

import { buildCatalog } from './catalog.ts';
import { parseCsv } from './csv.ts';
import { BUNDLED_CSV, BUNDLED_CSV_FILENAME } from './dataset.ts';
import { DatasetError } from './errors.ts';
import type { Catalog } from './types.ts';

export interface CatalogSource {
  kind: 'bundled' | 'remote';
  /** Oznaka izvora koja se prikazuje u podnožju i u detaljima. */
  label: string;
}

export interface CatalogLoadResult {
  catalog: Catalog;
  source: CatalogSource;
}

const REMOTE_URL = import.meta.env.VITE_HALAL_DATA_URL as string | undefined;

async function fetchCsv(url: string): Promise<string> {
  try {
    const response = await fetch(url, { headers: { accept: 'text/csv, text/plain' } });
    if (!response.ok) {
      throw new DatasetError('fetch-failed', `Udaljeni izvor je vratio status ${response.status}.`);
    }
    return await response.text();
  } catch (error) {
    if (error instanceof DatasetError) throw error;
    throw new DatasetError('fetch-failed', 'Udaljeni izvor podataka nije dostupan.', { cause: error });
  }
}

/** Učitava i normalizira katalog. Baca `DatasetError` kada podaci nisu upotrebljivi. */
export async function loadCatalog(): Promise<CatalogLoadResult> {
  const source: CatalogSource = REMOTE_URL
    ? { kind: 'remote', label: REMOTE_URL }
    : { kind: 'bundled', label: BUNDLED_CSV_FILENAME };

  const csv = REMOTE_URL ? await fetchCsv(REMOTE_URL) : BUNDLED_CSV;

  try {
    return { catalog: buildCatalog(parseCsv(csv)), source };
  } catch (error) {
    if (error instanceof DatasetError) throw error;
    throw new DatasetError(
      'unknown',
      error instanceof Error ? error.message : 'Nepoznata greška pri obradi podataka.',
      { cause: error },
    );
  }
}
