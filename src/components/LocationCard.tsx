import { useI18n } from '../i18n/I18nContext.tsx';
import { IncompleteDataBadge } from './IncompleteDataBadge.tsx';
import { UNCATEGORIZED_ID, type Location } from '../data/types.ts';

interface LocationCardProps {
  location: Location;
  onOpen: (id: string) => void;
}

/**
 * Kartica lokacije. Prikazuje isključivo podatke iz registra: naziv,
 * kategoriju (ako postoji), punu adresu, mjesto i područje.
 * Nema ocjena, recenzija, popularnosti ni radnog vremena.
 */
export function LocationCard({ location, onOpen }: LocationCardProps) {
  const { t, categoryLabel, regionLabel, missingFieldsLabel } = useI18n();
  const hasCategory = location.categoryId !== UNCATEGORIZED_ID;

  return (
    <article className="card">
      <h3 className="card__name">{location.name}</h3>

      <div className="card__tags">
        <span className={hasCategory ? 'tag tag--category' : 'tag tag--missing'}>
          <span className="tag__dot" aria-hidden="true" />
          {categoryLabel(location.categoryLabel)}
        </span>
        <span className="tag tag--region">{regionLabel(location.regionId)}</span>
        <IncompleteDataBadge fields={location.missingFields} />
      </div>

      <p className="card__address">{location.address}</p>
      <p className="card__place">
        {t('details.fieldPlace')}: {location.place}
      </p>

      {location.missingFields.length > 0 ? (
        <p className="card__note">
          {t('card.incompleteHint', { fields: missingFieldsLabel(location.missingFields) })}
        </p>
      ) : null}

      <div className="card__footer">
        <button
          type="button"
          className="btn btn--small"
          onClick={() => onOpen(location.id)}
          aria-label={`${t('card.details')}: ${location.name}`}
        >
          {t('card.details')}
        </button>
      </div>
    </article>
  );
}
