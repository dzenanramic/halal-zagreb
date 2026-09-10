import { ArrowRight, MapPin } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.tsx';
import { IncompleteDataBadge } from './IncompleteDataBadge.tsx';
import { UNCATEGORIZED_ID, type Location } from '../data/types.ts';

interface LocationCardProps {
  location: Location;
  onOpen: (id: string) => void;
}

/**
 * Kartica lokacije. Prikazuje isključivo podatke iz registra: kategoriju
 * (ako postoji), naziv, punu adresu, mjesto i područje.
 * Nema ocjena, recenzija, popularnosti ni radnog vremena.
 */
export function LocationCard({ location, onOpen }: LocationCardProps) {
  const { t, categoryLabel, regionLabel, missingFieldsLabel } = useI18n();
  const hasCategory = location.categoryId !== UNCATEGORIZED_ID;

  return (
    <article className="card">
      <div className="card__top">
        <span className={hasCategory ? 'card__category' : 'card__category card__category--missing'}>
          {categoryLabel(location.categoryLabel)}
        </span>
        <IncompleteDataBadge fields={location.missingFields} />
      </div>

      <h3 className="card__name">{location.name}</h3>

      <p className="card__address">{location.address}</p>

      {location.missingFields.length > 0 ? (
        <p className="card__note">
          {t('card.incompleteHint', { fields: missingFieldsLabel(location.missingFields) })}
        </p>
      ) : null}

      <div className="card__footer">
        <span className="card__meta">
          <MapPin size={14} aria-hidden="true" />
          <span className="card__meta-place">{location.place}</span>
          <span className="card__meta-region">{regionLabel(location.regionId)}</span>
        </span>

        <button
          type="button"
          className="card__details"
          onClick={() => onOpen(location.id)}
          aria-label={`${t('card.details')}: ${location.name}`}
        >
          {t('card.details')}
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
