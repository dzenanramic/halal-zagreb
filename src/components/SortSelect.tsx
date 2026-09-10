import { useId } from 'react';
import { useI18n } from '../i18n/I18nContext.tsx';
import type { SortKey } from '../data/types.ts';

interface SortSelectProps {
  value: SortKey;
  onChange: (sort: SortKey) => void;
  /**
   * `inline` - naziv "Sortiranje" je vidljiv uz padajući izbornik (traka).
   * `stacked` - naziv je samo za čitače ekrana, izbornik zauzima punu širinu
   * (drawer s filterima na mobitelu).
   */
  variant?: 'inline' | 'stacked';
}

const SORT_KEYS: SortKey[] = ['relevance', 'name', 'place'];

const LABEL_KEYS = {
  relevance: 'locations.sortRelevance',
  name: 'locations.sortName',
  place: 'locations.sortPlace',
} as const;

export function SortSelect({ value, onChange, variant = 'inline' }: SortSelectProps) {
  const { t } = useI18n();
  const selectId = useId();
  const stacked = variant === 'stacked';

  return (
    <div className={stacked ? 'select-wrap select-wrap--stacked' : 'select-wrap'}>
      <label className={stacked ? 'visually-hidden' : 'select-wrap__label'} htmlFor={selectId}>
        {t('locations.sortLabel')}
      </label>
      <select
        id={selectId}
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value as SortKey)}
      >
        {SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {t(LABEL_KEYS[key])}
          </option>
        ))}
      </select>
    </div>
  );
}
