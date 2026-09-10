/**
 * Pretraga, filtriranje i sortiranje lokacija.
 *
 * Sve funkcije su čiste i ne ovise o Reactu, pa se koriste i u testovima.
 */

import { ALL_CATEGORIES, type Location, type QueryState, type SortKey } from './types.ts';
import { foldText } from './text.ts';

/** Razbija upit na tokene; svaki token mora se negdje pronaći (logika I). */
export function tokenize(query: string): string[] {
  return foldText(query).split(' ').filter((token) => token.length > 0);
}

/**
 * Ocjena jednog tokena za lokaciju. Veća ocjena = bolje podudaranje.
 * Vraća null kada se token ne pojavljuje ni u nazivu, ni u mjestu, ni u adresi.
 */
export function tokenScore(location: Location, token: string): number | null {
  const name = location.search.name;
  const place = location.search.place;
  const address = location.search.address;

  if (name === token) return 120;
  if (name.startsWith(`${token} `) || name.startsWith(token)) return 100;
  if (name.split(' ').some((word) => word.startsWith(token))) return 80;
  if (name.includes(token)) return 60;
  if (place.startsWith(token)) return 50;
  if (place.includes(token)) return 40;
  if (address.includes(token)) return 30;
  return null;
}

/** Ukupna ocjena lokacije za sve tokene; null ako barem jedan token ne prolazi. */
export function scoreLocation(location: Location, tokens: string[]): number | null {
  if (tokens.length === 0) return 0;

  let total = 0;
  for (const token of tokens) {
    const score = tokenScore(location, token);
    if (score === null) return null;
    total += score;
  }
  return total;
}

/** Vraća true kada lokacija zadovoljava upit, područje i kategoriju. */
export function matchesFilters(location: Location, state: QueryState, tokens: string[]): boolean {
  if (state.region !== 'all' && location.regionId !== state.region) return false;
  if (state.category !== ALL_CATEGORIES && location.categoryId !== state.category) return false;
  return scoreLocation(location, tokens) !== null;
}

function compareByName(left: Location, right: Location): number {
  return left.name.localeCompare(right.name, 'hr');
}

function compareByPlace(left: Location, right: Location): number {
  const byPlace = left.place.localeCompare(right.place, 'hr');
  return byPlace !== 0 ? byPlace : compareByName(left, right);
}

/** Stabilno sortiranje prema odabranom kriteriju. */
export function sortLocations(
  locations: Location[],
  sort: SortKey,
  scores: Map<string, number>,
): Location[] {
  const sorted = [...locations];

  if (sort === 'name') {
    return sorted.sort((left, right) => compareByName(left, right) || left.order - right.order);
  }

  if (sort === 'place') {
    return sorted.sort((left, right) => compareByPlace(left, right) || left.order - right.order);
  }

  // Relevantnost: rezultat pretrage, a kod izjednačenja redoslijed iz registra.
  // Bez upita svi rezultati imaju istu ocjenu pa se zadržava redoslijed izvora.
  return sorted.sort((left, right) => {
    const scoreDiff = (scores.get(right.id) ?? 0) - (scores.get(left.id) ?? 0);
    if (scoreDiff !== 0) return scoreDiff;

    return left.order - right.order;
  });
}

export interface SelectionResult {
  locations: Location[];
  /** Ocjene po identifikatoru - koristi se za sortiranje po relevantnosti. */
  scores: Map<string, number>;
}

/** Primjenjuje pretragu, filtre i sortiranje te vraća rezultat. */
export function selectLocations(locations: Location[], state: QueryState): SelectionResult {
  const tokens = tokenize(state.query);
  const scores = new Map<string, number>();
  const filtered: Location[] = [];

  for (const location of locations) {
    const score = scoreLocation(location, tokens);
    if (score === null) continue;
    if (state.region !== 'all' && location.regionId !== state.region) continue;
    if (state.category !== ALL_CATEGORIES && location.categoryId !== state.category) continue;
    scores.set(location.id, score);
    filtered.push(location);
  }

  return { locations: sortLocations(filtered, state.sort, scores), scores };
}
