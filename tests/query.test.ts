import { describe, expect, it } from 'vitest';

import { selectLocations, tokenize } from '../src/data/query.ts';
import { ALL_CATEGORIES, UNCATEGORIZED_ID, type QueryState, type SortKey } from '../src/data/types.ts';
import { loadTestCatalog } from './helpers.ts';

const catalog = loadTestCatalog();
const locations = catalog.locations;

function query(partial: Partial<QueryState>): QueryState {
  return {
    query: '',
    region: 'all',
    category: ALL_CATEGORIES,
    sort: 'relevance',
    ...partial,
  };
}

function names(state: QueryState): string[] {
  return selectLocations(locations, state).locations.map((location) => location.name);
}

describe('Pretraga', () => {
  it('radi bez dijakritike i velikih slova', () => {
    expect(names(query({ query: 'sesvete' }))).toContain('ANAMARIJA COMPANY d.o.o');
    expect(names(query({ query: 'SKOBIC' }))).toContain('Dr. Škobić d.o.o.');
    expect(names(query({ query: 'radnicka' })).length).toBeGreaterThanOrEqual(3);
  });

  it('pronalazi po mjestu i po adresi', () => {
    expect(names(query({ query: 'velika gorica' })).length).toBe(2);
    expect(names(query({ query: 'maksimirska' }))).toEqual(['Euroadria d.o.o.']);
  });

  it('traži sve unesene riječi (logika I)', () => {
    expect(names(query({ query: 'zvijezda cavica' }))).toEqual(['Zvijezda plus d.o.o.']);
    expect(names(query({ query: 'zvijezda split' }))).toEqual([]);
  });

  it('vraća prazan rezultat za nepostojeći pojam', () => {
    expect(names(query({ query: 'restoran koji ne postoji' }))).toEqual([]);
  });

  it('razbija upit na tokene', () => {
    expect(tokenize('  Radnička   cesta ')).toEqual(['radnicka', 'cesta']);
    expect(tokenize('   ')).toEqual([]);
  });
});

describe('Filteri', () => {
  it('filtrira Grad Zagreb i Zagrebačku okolicu', () => {
    const city = selectLocations(locations, query({ region: 'zagreb-city' })).locations;
    const wider = selectLocations(locations, query({ region: 'zagreb-wider' })).locations;

    expect(city).toHaveLength(25);
    expect(wider).toHaveLength(9);
    expect(city.every((location) => location.regionId === 'zagreb-city')).toBe(true);
    expect(wider.every((location) => location.regionId === 'zagreb-wider')).toBe(true);
  });

  it('filtrira zapise bez kategorije', () => {
    const result = selectLocations(locations, query({ category: UNCATEGORIZED_ID })).locations;
    expect(result).toHaveLength(1);
    expect(result[0]?.categoryLabel).toBeNull();
  });

  it('filtrira po stvarnoj kategoriji iz registra', () => {
    // Identifikatori kategorija izvode se iz vrijednosti u CSV-u (bez dijakritike).
    expect(catalog.categories.map((category) => category.id)).toContain('proizvodaci');

    const manufacturers = selectLocations(locations, query({ category: 'proizvodaci' })).locations;
    expect(manufacturers).toHaveLength(19);

    const hotels = selectLocations(locations, query({ category: 'hotelijeri' })).locations;
    expect(hotels).toHaveLength(6);

    const unknown = selectLocations(locations, query({ category: 'kategorija-koje-nema' })).locations;
    expect(unknown).toEqual([]);
  });

  it('kombinira pretragu, područje i kategoriju', () => {
    const result = selectLocations(
      locations,
      query({ query: 'za', region: 'zagreb-city', category: 'hotelijeri' }),
    ).locations;

    expect(result.length).toBeGreaterThan(0);
    for (const location of result) {
      expect(location.regionId).toBe('zagreb-city');
      expect(location.categoryId).toBe('hotelijeri');
    }
  });
});

describe('Sortiranje', () => {
  const sortCases: SortKey[] = ['relevance', 'name', 'place'];

  it('abecedno sortira prema nazivu', () => {
    const result = selectLocations(locations, query({ sort: 'name' })).locations;
    const sorted = [...result].sort((left, right) => left.name.localeCompare(right.name, 'hr'));
    expect(result.map((location) => location.name)).toEqual(sorted.map((location) => location.name));
  });

  it('sortira prema mjestu', () => {
    const result = selectLocations(locations, query({ sort: 'place' })).locations;
    const places = result.map((location) => location.place);
    expect(places).toEqual([...places].sort((left, right) => left.localeCompare(right, 'hr')));
    expect(places[0]).toBe('Božjakovina');
  });
  it('po relevantnosti stavlja točno podudaranje naziva na prvo mjesto', () => {
    const result = selectLocations(locations, query({ query: 'franck' })).locations;
    expect(result[0]?.name).toBe('Franck d.d.');
  });

  it('bez upita zadržava redoslijed iz registra', () => {
    const result = selectLocations(locations, query({ sort: 'relevance' })).locations;
    expect(result.map((location) => location.order)).toEqual(
      [...result].map((location) => location.order).sort((a, b) => a - b),
    );
  });

  it('rezultat je stabilan za sve kriterije', () => {
    for (const sort of sortCases) {
      const first = names(query({ query: 'zagreb', sort }));
      const second = names(query({ query: 'zagreb', sort }));
      expect(first).toEqual(second);
    }
  });
});
