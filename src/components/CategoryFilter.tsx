import { useI18n } from '../i18n/I18nContext.tsx';
import { ALL_CATEGORIES, type CategorySummary } from '../data/types.ts';

interface CategoryFilterProps {
  value: string;
  categories: CategorySummary[];
  idPrefix: string;
  onChange: (category: string) => void;
}

/**
 * Filter kategorija. Popis se izvodi iz stvarnih vrijednosti u registru;
 * zapisi bez kategorije dobivaju zasebnu stavku "Kategorija nije navedena".
 */
export function CategoryFilter({ value, categories, idPrefix, onChange }: CategoryFilterProps) {
  const { t, categoryLabel, formatNumber } = useI18n();
  const name = `${idPrefix}-category`;
  const total = categories.reduce((sum, category) => sum + category.count, 0);

  return (
    <fieldset className="filters__group">
      <legend className="filters__legend">{t('filters.category')}</legend>
      <div className="option-list">
        <label className="option">
          <input
            className="option__input"
            type="radio"
            name={name}
            value={ALL_CATEGORIES}
            checked={value === ALL_CATEGORIES}
            onChange={() => onChange(ALL_CATEGORIES)}
          />
          <span className="option__label">{t('filters.categoryAll')}</span>
          <span className="option__count">{formatNumber(total)}</span>
        </label>

        {categories.map((category) => (
          <label className="option" key={category.id}>
            <input
              className="option__input"
              type="radio"
              name={name}
              value={category.id}
              checked={value === category.id}
              onChange={() => onChange(category.id)}
            />
            <span className="option__label">{categoryLabel(category.label)}</span>
            <span className="option__count">{formatNumber(category.count)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
