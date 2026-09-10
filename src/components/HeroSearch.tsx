import { Search, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.tsx';

interface HeroSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  /** Stvarni brojevi iz učitanog kataloga; null dok se podaci učitavaju. */
  counts: { total: number; city: number; wider: number } | null;
}

/** Uvodni blok: konkretna poruka, pretraga i stvarni brojevi iz kataloga. */
export function HeroSearch({ query, onQueryChange, counts }: HeroSearchProps) {
  const { t, tp, formatNumber } = useI18n();

  return (
    <section className="hero" aria-labelledby="hero-title">
      <span className="hero__pattern" aria-hidden="true" />
      <div className="container hero__inner">
        <h1 className="hero__title" id="hero-title">
          {t('hero.title')}
        </h1>
        <p className="hero__lead">{t('hero.lead')}</p>

        <div className="hero__search">
          <label className="visually-hidden" htmlFor="location-search">
            {t('hero.searchLabel')}
          </label>
          <div className="search">
            <Search className="search__icon" size={18} aria-hidden="true" />
            <input
              id="location-search"
              className="search__input"
              type="search"
              autoComplete="off"
              placeholder={t('hero.searchPlaceholder')}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
            {query !== '' ? (
              <button
                type="button"
                className="search__clear"
                onClick={() => onQueryChange('')}
              >
                <X size={18} aria-hidden="true" />
                <span className="visually-hidden">{t('hero.searchClear')}</span>
              </button>
            ) : null}
          </div>
          <p className="hero__hint">{t('hero.searchHint')}</p>
        </div>

        {counts !== null ? (
          <ul className="hero__stats">
            <li className="hero__stat">{tp('hero.statTotal', counts.total)}</li>
            <li className="hero__stat">
              {t('hero.statCity', { count: formatNumber(counts.city) })}
            </li>
            <li className="hero__stat">
              {t('hero.statWider', { count: formatNumber(counts.wider) })}
            </li>
          </ul>
        ) : null}
      </div>
    </section>
  );
}
