/**
 * Izvor podataka koji se isporučuje uz aplikaciju.
 *
 * CSV datoteka je jedini izvor istine i uvozi se iz korijena projekta tako da
 * se podaci ne prepisuju ručno u TypeScript. Datoteka se ne mijenja; sva
 * interpretacija (područje, mjesto, kategorija) događa se u kodu.
 */

import csvSource from '../../halal-certificirane-tvrtke-excel.csv?raw';

export const BUNDLED_CSV: string = csvSource;

export const BUNDLED_CSV_FILENAME = 'halal-certificirane-tvrtke-excel.csv';
