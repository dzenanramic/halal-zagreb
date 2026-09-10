import { SlidersHorizontal } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.tsx';
import { SortSelect } from './SortSelect.tsx';
import type { SortKey } from '../data/types.ts';

interface SearchControlsProps {
  resultCount: number;
  query: string;
  sort: SortKey;
  activeFilterCount: number;
  onSortChange: (sort: SortKey) => void;
  onOpenFilters: () => void;
}

/** Traka iznad rezultata: broj rezultata, sortiranje i ulaz u filtre na mobitelu. */
export function SearchControls({
  resultCount,
  query,
  sort,
  activeFilterCount,
  onSortChange,
  onOpenFilters,
}: SearchControlsProps) {
  const { t, tp } = useI18n();
  const trimmedQuery = query.trim();

  return (
    <div className="toolbar">
      <p className="toolbar__count" role="status" aria-live="polite">
        {tp('locations.results', resultCount)}
        {trimmedQuery !== '' ? (
          <span> {t('locations.resultsFor', { query: trimmedQuery })}</span>
        ) : null}
      </p>

      <div className="toolbar__controls">
        <button type="button" className="btn btn--small filters-toggle" onClick={onOpenFilters}>
          <SlidersHorizontal size={16} aria-hidden="true" />
          {activeFilterCount > 0
            ? t('filters.openWithCount', { count: activeFilterCount })
            : t('filters.open')}
        </button>
        <SortSelect value={sort} onChange={onSortChange} />
      </div>
    </div>
  );
}
