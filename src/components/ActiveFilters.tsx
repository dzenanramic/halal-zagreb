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
      <div className="active-filters__head">
        <p className="eyebrow eyebrow--muted">{t('filters.active')}</p>
        {filters.length > 0 ? (
          <button type="button" className="link-btn" onClick={onClearAll}>
            {t('filters.clearAll')}
          </button>
        ) : null}
      </div>

      {filters.length === 0 ? (
        <p className="active-filters__empty">{t('filters.none')}</p>
      ) : (
        <ul className="active-filters__list">
          {filters.map((filter) => (
            <li key={filter.kind}>
              <span className="chip">
                <span className="chip__label">{filter.label}</span>
                <button
                  type="button"
                  className="chip__remove"
                  onClick={filter.remove}
                  aria-label={t('filters.remove', { label: filter.label })}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
