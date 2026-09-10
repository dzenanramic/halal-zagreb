import { useI18n } from '../i18n/I18nContext.tsx';

/** Stanje učitavanja: poruka za čitače ekrana i neutralne skeletne kartice. */
export function LoadingState() {
  const { t } = useI18n();

  return (
    <div>
      <div className="state" role="status" aria-live="polite">
        <p className="state__title">{t('state.loading')}</p>
        <p className="state__body">{t('state.loadingHint')}</p>
      </div>
      <div className="skeleton-grid" aria-hidden="true">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    </div>
  );
}
