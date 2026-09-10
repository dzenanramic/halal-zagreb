import { LANGUAGES, type Language } from '../i18n/translations.ts';
import { useI18n } from '../i18n/I18nContext.tsx';

const SHORT_LABELS: Record<Language, string> = {
  hr: 'HR',
  en: 'EN',
};

const FULL_LABELS: Record<Language, string> = {
  hr: 'Hrvatski',
  en: 'English',
};

/** Prebacivanje jezika bez ponovnog učitavanja stranice. */
export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="lang-switch" role="group" aria-label={t('nav.language')}>
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          className="lang-switch__button"
          aria-pressed={language === code}
          lang={code}
          title={FULL_LABELS[code]}
          onClick={() => setLanguage(code)}
        >
          <span aria-hidden="true">{SHORT_LABELS[code]}</span>
          <span className="visually-hidden">{FULL_LABELS[code]}</span>
        </button>
      ))}
    </div>
  );
}
