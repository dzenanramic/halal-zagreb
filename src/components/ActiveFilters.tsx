import { X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.tsx';
import type { ActiveFilter } from '../hooks/useLocationQuery.ts';

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onClearAll: () => void;
}

/** Svi aktivni filteri na jednom mjestu, svaki se može ukloniti pojedinačno. */
export function ActiveFilters({ filters, onClearAll }: ActiveFiltersProps) {
  const { t } = useI18n();

  return (
    <div className="active-filters">
      <p className="filters__heading">{t('filters.active')}</p>

      {filters.length === 0 ? (
        <p className="active-filters__empty">{t('filters.none')}</p>
      ) : (
        <ul className="active-filters__list">
          {filters.map((filter) => (
            <li key={`${filter.kind}-${filter.label}`}>
              <span className="filter-chip">
                <span className="filter-chip__label">{filter.label}</span>
                <button
                  type="button"
                  className="filter-chip__remove"
                  onClick={filter.remove}
                  aria-label={t('filters.remove', { label: filter.label })}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
          <li>
            <button type="button" className="btn btn--quiet btn--small" onClick={onClearAll}>
              {t('filters.clearAll')}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
