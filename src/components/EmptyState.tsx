import { useI18n } from '../i18n/I18nContext.tsx';

interface EmptyStateProps {
  onClearAll: () => void;
}

/** Prazno stanje: nema rezultata za trenutačne filtere. */
export function EmptyState({ onClearAll }: EmptyStateProps) {
  const { t } = useI18n();

  return (
    <div className="state">
      <h3 className="state__title">{t('state.emptyTitle')}</h3>
      <p className="state__body">{t('state.emptyBody')}</p>
      <div className="state__actions">
        <button type="button" className="btn btn--primary" onClick={onClearAll}>
          {t('filters.clearAll')}
        </button>
      </div>
    </div>
  );
}
