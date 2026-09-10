import { SlidersHorizontal } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.tsx';
import { SortSelect } from './SortSelect.tsx';
import type { SortKey } from '../data/types.ts';

interface ResultsToolbarProps {
  resultCount: number;
  sort: SortKey;
  activeFilterCount: number;
  onSortChange: (sort: SortKey) => void;
  onOpenFilters: () => void;
}

/**
 * Traka iznad rezultata: stvarni broj pronađenih lokacija, sortiranje i
 * (na mobitelu) ulaz u filtere. Ljepljiva je kako bi filteri i sortiranje
 * ostali dostupni tijekom listanja.
 */
export function ResultsToolbar({
  resultCount,
  sort,
  activeFilterCount,
  onSortChange,
  onOpenFilters,
}: ResultsToolbarProps) {
  const { t, tp } = useI18n();

  return (
    <div className="index-bar">
      <p className="index-bar__count" role="status" aria-live="polite">
        {tp('locations.results', resultCount)}
      </p>

      <div className="index-bar__actions">
        <button
          type="button"
          className="btn btn--ghost btn--small filters-toggle"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          {activeFilterCount > 0
            ? t('filters.openWithCount', { count: activeFilterCount })
            : t('filters.open')}
        </button>
        <div className="index-bar__sort">
          <SortSelect value={sort} onChange={onSortChange} />
        </div>
      </div>
    </div>
  );
}
