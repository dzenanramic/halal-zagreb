/**
 * Stanje filtera i sortiranja.
 *
 * Pretraga je uklonjena iz sučelja, pa hook ne izlaže radnju za upit; polje
 * `query` ostaje u stanju (uvijek prazno) kako bi se pretraga mogla vratiti
 * bez promjene podatkovnog sloja - funkcije pretrage u `src/data/query.ts`
 * ostaju pokrivene testovima.
 */

import { useCallback, useMemo, useState } from 'react';
import { selectLocations } from '../data/query.ts';
import {
  ALL_CATEGORIES,
  type CategorySummary,
  type Location,
  type QueryState,
  type RegionFilter,
  type SortKey,
} from '../data/types.ts';
import { useI18n } from '../i18n/I18nContext.tsx';

export interface ActiveFilter {
  kind: 'region' | 'category';
  /** Prikazani naziv filtera (već preveden). */
  label: string;
  remove: () => void;
}

export interface LocationQueryController {
  state: QueryState;
  results: Location[];
  setRegion: (region: RegionFilter) => void;
  setCategory: (category: string) => void;
  setSort: (sort: SortKey) => void;
  clearAll: () => void;
  activeFilters: ActiveFilter[];
  activeFilterCount: number;
}

const INITIAL_STATE: QueryState = {
  query: '',
  region: 'all',
  category: ALL_CATEGORIES,
  sort: 'relevance',
};

export function useLocationQuery(
  locations: Location[],
  categories: CategorySummary[],
): LocationQueryController {
  const { categoryLabel, regionLabel } = useI18n();
  const [state, setState] = useState<QueryState>(INITIAL_STATE);

  const results = useMemo(() => selectLocations(locations, state).locations, [locations, state]);

  const setRegion = useCallback((region: RegionFilter) => {
    setState((current) => ({ ...current, region }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setState((current) => ({ ...current, category }));
  }, []);

  const setSort = useCallback((sort: SortKey) => {
    setState((current) => ({ ...current, sort }));
  }, []);

  const clearAll = useCallback(() => {
    setState((current) => ({ ...INITIAL_STATE, sort: current.sort }));
  }, []);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (state.region !== 'all') {
      const region = state.region;
      filters.push({
        kind: 'region',
        label: regionLabel(region),
        remove: () => setState((current) => ({ ...current, region: 'all' })),
      });
    }

    if (state.category !== ALL_CATEGORIES) {
      const categoryId = state.category;
      const summary = categories.find((entry) => entry.id === categoryId);
      filters.push({
        kind: 'category',
        label: categoryLabel(summary?.label ?? null),
        remove: () => setState((current) => ({ ...current, category: ALL_CATEGORIES })),
      });
    }

    return filters;
  }, [state, categoryLabel, regionLabel, categories]);

  return {
    state,
    results,
    setRegion,
    setCategory,
    setSort,
    clearAll,
    activeFilters,
    activeFilterCount: activeFilters.length,
  };
}
