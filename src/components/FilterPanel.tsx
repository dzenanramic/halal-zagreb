import { useI18n } from '../i18n/I18nContext.tsx';
import { RegionFilter } from './RegionFilter.tsx';
import { CategoryFilter } from './CategoryFilter.tsx';
import type { CategorySummary, RegionFilter as RegionFilterValue, RegionSummary } from '../data/types.ts';

export interface FilterPanelProps {
  /** Prefiks za id/name radio grupa - sidebar i drawer ne dijele stanje. */
  idPrefix: string;
  regions: RegionSummary[];
  categories: CategorySummary[];
  region: RegionFilterValue;
  category: string;
  activeFilterCount: number;
  onRegionChange: (region: RegionFilterValue) => void;
  onCategoryChange: (category: string) => void;
  onClearAll: () => void;
}

/**
 * Sadržaj filtera: područje, kategorija i uklanjanje svih filtera.
 * Isti sadržaj koristi bočni panel na desktopu i drawer na mobitelu.
 */
export function FilterPanel({
  idPrefix,
  regions,
  categories,
  region,
  category,
  activeFilterCount,
  onRegionChange,
  onCategoryChange,
  onClearAll,
}: FilterPanelProps) {
  const { t } = useI18n();

  return (
    <div>
      <h3 className="filters__heading" id={`${idPrefix}-filters-title`}>
        {t('filters.title')}
      </h3>
      <RegionFilter
        value={region}
        counts={regions}
        idPrefix={idPrefix}
        onChange={onRegionChange}
      />
      <CategoryFilter
        value={category}
        categories={categories}
        idPrefix={idPrefix}
        onChange={onCategoryChange}
      />
      <div className="filters__section">
        <button
          type="button"
          className="btn btn--small btn--full"
          onClick={onClearAll}
          disabled={activeFilterCount === 0}
        >
          {t('filters.clearAll')}
        </button>
      </div>
    </div>
  );
}
