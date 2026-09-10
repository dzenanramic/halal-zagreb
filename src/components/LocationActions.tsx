import type { ReactElement } from 'react';
import { ExternalLink, MapPin, Phone } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.tsx';
import type { Location } from '../data/types.ts';

/**
 * Radnje koje ovise o podacima kojih CSV izvor ove verzije ne sadrži:
 * koordinate, telefon i web adresa.
 *
 * Komponenta je namjerno neaktivna dok su ti podaci prazni - gumbi koji ne
 * vode nikamo ne smiju se prikazivati. Kada se izvor proširi (npr. kroz
 * `Location.external`), ove radnje se automatski pojavljuju.
 */
export function LocationActions({ location }: { location: Location }) {
  const { t } = useI18n();
  const external = location.external ?? null;

  if (external === null) return null;

  const actions: ReactElement[] = [];

  const coordinates = external.coordinates ?? null;
  if (coordinates !== null) {
    const { latitude, longitude } = coordinates;
    actions.push(
      <a
        key="maps"
        className="btn btn--small"
        href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`}
        target="_blank"
        rel="noreferrer noopener"
      >
        <MapPin size={16} aria-hidden="true" />
        {t('details.openInMaps')}
      </a>,
    );
  }

  const phone = external.phone ?? null;
  if (phone !== null && phone.trim() !== '') {
    actions.push(
      <a key="phone" className="btn btn--small" href={`tel:${phone.replace(/\s+/g, '')}`}>
        <Phone size={16} aria-hidden="true" />
        {t('details.call')}
      </a>,
    );
  }

  const website = external.website ?? null;
  if (website !== null && website.trim() !== '') {
    actions.push(
      <a
        key="website"
        className="btn btn--small"
        href={website}
        target="_blank"
        rel="noreferrer noopener"
      >
        <ExternalLink size={16} aria-hidden="true" />
        {t('details.visitWebsite')}
      </a>,
    );
  }

  if (actions.length === 0) return null;

  return <div className="state__actions">{actions}</div>;
}
