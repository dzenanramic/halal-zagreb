import { useId } from 'react';
import { useI18n } from '../i18n/I18nContext.tsx';
import type { SortKey } from '../data/types.ts';

interface SortSelectProps {
  value: SortKey;
  onChange: (sort: SortKey) => void;
}

const SORT_KEYS: SortKey[] = ['relevance', 'name', 'place'];

const LABEL_KEYS = {
  relevance: 'locations.sortRelevance',
  name: 'locations.sortName',
  place: 'locations.sortPlace',
} as const;

export function SortSelect({ value, onChange }: SortSelectProps) {
  const { t } = useI18n();
  const selectId = useId();

  return (
    <div className="select-wrap">
      <label className="select-wrap__label" htmlFor={selectId}>
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
