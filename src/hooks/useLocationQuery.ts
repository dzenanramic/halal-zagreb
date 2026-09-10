/**
 * Stanje pretrage, filtera i sortiranja.
 *
 * Drži sirovo stanje (upit, područje, kategorija, sortiranje) i iz njega
 * izvodi rezultate te popis aktivnih filtera s prijevodima i radnjom uklanjanja.
 */

import { useCallback, useMemo, useState } from 'react';
import { selectLocations } from '../data/query.ts';
import {
  ALL_CATEGORIES,
  type Location,
  type QueryState,
  type RegionFilter,
  type SortKey,
  type CategorySummary,
} from '../data/types.ts';
import { useI18n } from '../i18n/I18nContext.tsx';

export interface ActiveFilter {
  kind: 'query' | 'region' | 'category';
  /** Prikazani naziv filtera (već preveden). */
  label: string;
  remove: () => void;
}

export interface LocationQueryController {
  state: QueryState;
  results: Location[];
  setQuery: (query: string) => void;
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
  const { t, categoryLabel, regionLabel } = useI18n();
  const [state, setState] = useState<QueryState>(INITIAL_STATE);

  const results = useMemo(
    () => selectLocations(locations, state).locations,
    [locations, state],
  );

  const setQuery = useCallback((query: string) => {
    setState((current) => ({ ...current, query }));
  }, []);

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

    const trimmedQuery = state.query.trim();
    if (trimmedQuery !== '') {
      filters.push({
        kind: 'query',
        label: t('filters.activeQuery', { value: trimmedQuery }),
        remove: () => setState((current) => ({ ...current, query: '' })),
      });
    }

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
  }, [state, t, regionLabel, categoryLabel, categories]);

  return {
    state,
    results,
    setQuery,
    setRegion,
    setCategory,
    setSort,
    clearAll,
    activeFilters,
    activeFilterCount: activeFilters.length,
  };
}
