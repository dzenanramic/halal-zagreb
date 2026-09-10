import { useI18n } from '../i18n/I18nContext.tsx';
import type { TranslationKey } from '../i18n/translations.ts';
import type { DatasetErrorCode, DatasetErrorInfo } from '../data/types.ts';

interface ErrorStateProps {
  info: DatasetErrorInfo;
  onRetry: () => void;
}

const BODY_KEYS: Partial<Record<DatasetErrorCode, TranslationKey>> = {
  'empty-source': 'state.errorEmpty',
  'missing-columns': 'state.errorColumns',
  'no-zagreb-records': 'state.errorNoRecords',
};

/** Stanje greške: jasna poruka, ponovni pokušaj i tehnički detalj na zahtjev. */
export function ErrorState({ info, onRetry }: ErrorStateProps) {
  const { t } = useI18n();
  const bodyKey = BODY_KEYS[info.code] ?? 'state.errorBody';

  return (
    <div className="state state--error" role="alert">
      <h3 className="state__title">{t('state.errorTitle')}</h3>
      <p className="state__body">{t(bodyKey)}</p>

      <div className="state__actions">
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          {t('state.retry')}
        </button>
      </div>

      <details className="state__details">
        <summary>{t('state.errorDetails')}</summary>
        <p>{t('state.errorCode', { code: info.code })}</p>
        <code>{info.message}</code>
      </details>
    </div>
  );
}
