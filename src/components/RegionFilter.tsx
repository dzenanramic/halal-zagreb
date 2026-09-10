import { useI18n } from '../i18n/I18nContext.tsx';
import type { RegionFilter, RegionSummary } from '../data/types.ts';

interface RegionFilterProps {
  value: RegionFilter;
  counts: RegionSummary[];
  idPrefix: string;
  onChange: (region: RegionFilter) => void;
}

/** Filter područja: sve lokacije, Grad Zagreb, Zagrebačka okolica. */
export function RegionFilter({ value, counts, idPrefix, onChange }: RegionFilterProps) {
  const { t, formatNumber } = useI18n();
  const name = `${idPrefix}-region`;

  const cityCount = counts.find((entry) => entry.id === 'zagreb-city')?.count ?? 0;
  const widerCount = counts.find((entry) => entry.id === 'zagreb-wider')?.count ?? 0;

  const options: { id: RegionFilter; label: string; count: number }[] = [
    { id: 'all', label: t('filters.regionAll'), count: cityCount + widerCount },
    { id: 'zagreb-city', label: t('filters.regionCity'), count: cityCount },
    { id: 'zagreb-wider', label: t('filters.regionWider'), count: widerCount },
  ];

  return (
    <fieldset className="filters__section">
      <legend className="filters__heading">{t('filters.region')}</legend>
      <p className="filters__hint">{t('filters.regionHint')}</p>
      <div className="option-list">
        {options.map((option) => (
          <label className="option" key={option.id}>
            <input
              className="option__input"
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
            />
            <span className="option__label">{option.label}</span>
            <span className="option__count">{formatNumber(option.count)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
