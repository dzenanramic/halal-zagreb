/**
 * i18n kontekst: jezik, prijevod, pluralizacija i oblikovanje brojeva.
 *
 * Jezik se pamti u localStorage i mijenja bez ponovnog učitavanja stranice.
 * Hrvatski je zadani jezik.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  LANGUAGES,
  translateCategoryLabel,
  translations,
  type Language,
  type PluralForms,
  type TranslationKey,
} from './translations.ts';
import type { MissingField, RegionId } from '../data/types.ts';

const STORAGE_KEY = 'halal-zagreb:language';

export interface I18nValue {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Prijevod s interpolacijom: t('key', { count: 3 }). */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** Prijevod s pluralizacijom: tp('locations.results', 3). */
  tp: (key: TranslationKey, count: number, vars?: Record<string, string | number>) => string;
  /** Naziv kategorije iz registra na aktivnom jeziku (null = nije navedena). */
  categoryLabel: (label: string | null) => string;
  regionLabel: (regionId: RegionId) => string;
  /** Popis polja koja nedostaju, npr. "kategorija, poštanski broj". */
  missingFieldsLabel: (fields: MissingField[]) => string;
  formatNumber: (value: number) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as string[]).includes(value);
}

function readStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // localStorage može biti onemogućen (privatni način rada); tada ostaje HR.
  }
  return 'hr';
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (vars === undefined) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}

/** Hrvatska pravila množine: 1 lokacija, 2-4 lokacije, 5+ lokacija. */
function pickPlural(forms: PluralForms, count: number, language: Language): string {
  if (language === 'hr') {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return forms.one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms.few ?? forms.other;
    return forms.other;
  }
  return count === 1 ? forms.one : forms.other;
}

const MISSING_FIELD_KEYS: Record<MissingField, TranslationKey> = {
  category: 'missing.category',
  postalCode: 'missing.postalCode',
  country: 'missing.country',
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => readStoredLanguage());

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const value = translations[language][key];
      return interpolate(typeof value === 'string' ? value : value.other, vars);
    },
    [language],
  );

  const tp = useCallback(
    (key: TranslationKey, count: number, vars?: Record<string, string | number>): string => {
      const value = translations[language][key];
      const template = typeof value === 'string' ? value : pickPlural(value, count, language);
      return interpolate(template, { count, ...vars });
    },
    [language],
  );

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Prepisivanje postavke nije kritično ako localStorage nije dostupan.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nValue>(() => {
    const formatNumber = (input: number): string =>
      new Intl.NumberFormat(language === 'hr' ? 'hr-HR' : 'en-GB').format(input);

    return {
      language,
      setLanguage,
      t,
      tp,
      formatNumber,
      categoryLabel: (label: string | null): string =>
        label === null ? t('filters.categoryMissing') : translateCategoryLabel(label, language),
      regionLabel: (regionId: RegionId): string =>
        regionId === 'zagreb-city' ? t('region.city') : t('region.wider'),
      missingFieldsLabel: (fields: MissingField[]): string =>
        fields.map((field) => t(MISSING_FIELD_KEYS[field])).join(', '),
    };
  }, [language, setLanguage, t, tp]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Pristup prijevodima. Baca grešku ako se koristi izvan providera. */
export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (context === null) {
    throw new Error('useI18n se mora koristiti unutar I18nProvider.');
  }
  return context;
}
