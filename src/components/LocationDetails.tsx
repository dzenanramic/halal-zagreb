import { Copy } from 'lucide-react';
import { Panel } from './Panel.tsx';
import { LocationActions } from './LocationActions.tsx';
import { IncompleteDataBadge } from './IncompleteDataBadge.tsx';
import { useI18n } from '../i18n/I18nContext.tsx';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { UNCATEGORIZED_ID, type Location } from '../data/types.ts';

interface LocationDetailsProps {
  /** null kada identifikator iz rute ne postoji u katalogu. */
  location: Location | null;
  sourceFile: string;
  onClose: () => void;
}

interface DetailRow {
  label: string;
  value: string;
  missing: boolean;
}

function DataList({ rows }: { rows: DetailRow[] }) {
  return (
    <dl className="data-list">
      {rows.map((row) => (
        <div className="data-list__row" key={row.label}>
          <dt className="data-list__label">{row.label}</dt>
          <dd className={`data-list__value${row.missing ? ' data-list__value--missing' : ''}`}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Detalji lokacije prikazuju samo podatke koji u izvoru postoje.
 * Polja koja registar ne sadrži eksplicitno su označena kao nedostupna,
 * bez izmišljenih vrijednosti.
 */
export function LocationDetails({ location, sourceFile, onClose }: LocationDetailsProps) {
  const { t, categoryLabel, regionLabel } = useI18n();
  const { status, copy } = useCopyToClipboard();

  const titleId = 'location-details-title';

  if (location === null) {
    return (
      <Panel
        open
        titleId={titleId}
        eyebrow={t('details.title')}
        title={t('details.notFoundTitle')}
        closeLabel={t('details.close')}
        closeHint={t('details.closeHint')}
        onClose={onClose}
      >
        <p className="state__body">{t('details.notFoundBody')}</p>
        <div className="state__actions">
          <button type="button" className="btn" onClick={onClose}>
            {t('details.back')}
          </button>
        </div>
      </Panel>
    );
  }

  const notSpecified = t('details.notSpecified');
  const notAvailable = t('details.notAvailable');
  const external = location.external ?? null;
  const hasCategory = location.categoryId !== UNCATEGORIZED_ID;

  const recordRows: DetailRow[] = [
    { label: t('details.fieldName'), value: location.name, missing: false },
    { label: t('details.fieldAddress'), value: location.address, missing: false },
    {
      label: t('details.fieldCategory'),
      value: categoryLabel(location.categoryLabel),
      missing: !hasCategory,
    },
    { label: t('details.fieldPlace'), value: location.place, missing: false },
    { label: t('details.fieldRegion'), value: regionLabel(location.regionId), missing: false },
    {
      label: t('details.fieldPostalCode'),
      value: location.postalCode ?? notSpecified,
      missing: location.postalCode === null,
    },
    {
      label: t('details.fieldCountry'),
      value: location.country ?? notSpecified,
      missing: location.country === null,
    },
    {
      label: t('details.fieldSource'),
      value: t('details.sourceValue', { file: sourceFile, line: location.sourceLine }),
      missing: false,
    },
  ];

  const coordinates = external?.coordinates ?? null;
  const phone = external?.phone ?? null;
  const website = external?.website ?? null;
  const openingHours = external?.openingHours ?? null;

  const availabilityRows: DetailRow[] = [
    { label: t('details.fieldPhone'), value: phone ?? notAvailable, missing: phone === null },
    { label: t('details.fieldWebsite'), value: website ?? notAvailable, missing: website === null },
    {
      label: t('details.fieldHours'),
      value: openingHours ?? notAvailable,
      missing: openingHours === null,
    },
    {
      label: t('details.fieldCoordinates'),
      value:
        coordinates === null ? notAvailable : `${coordinates.latitude}, ${coordinates.longitude}`,
      missing: coordinates === null,
    },
  ];

  return (
    <Panel
      open
      titleId={titleId}
      eyebrow={t('details.title')}
      title={location.name}
      closeLabel={t('details.close')}
      closeHint={t('details.closeHint')}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--primary btn--full" onClick={() => copy(location.address)}>
            <Copy size={16} aria-hidden="true" />
            {t('details.copyAddress')}
          </button>
          <p className="details__copy-status" role="status" aria-live="polite">
            {status === 'copied' ? t('details.copied') : null}
            {status === 'failed' ? t('details.copyFailed') : null}
          </p>
        </>
      }
    >
      <div className="details__section">
        <div className="details__tags">
          <span className={hasCategory ? 'tag tag--region' : 'tag tag--missing'}>
            {hasCategory ? null : <span className="tag__dot" aria-hidden="true" />}
            {categoryLabel(location.categoryLabel)}
          </span>
          <span className="tag tag--region">{regionLabel(location.regionId)}</span>
          <IncompleteDataBadge fields={location.missingFields} />
        </div>
      </div>

      <section className="details__section">
        <h3 className="eyebrow eyebrow--muted">{t('details.sectionRecord')}</h3>
        <DataList rows={recordRows} />
      </section>

      <section className="details__section">
        <h3 className="eyebrow eyebrow--muted">{t('details.sectionAvailability')}</h3>
        <DataList rows={availabilityRows} />
        <p className="details__note">{t('details.missingNote')}</p>
      </section>

      <section className="details__section">
        {/*
          Mjesto za kartu: kada izvor bude sadržavao koordinate
          (Location.external.coordinates), ovdje se može umetnuti komponenta
          interaktivne karte bez promjene ostalih dijelova prikaza.
        */}
        <LocationActions location={location} />
        <p className="details__note">{t('details.futureNote')}</p>
      </section>
    </Panel>
  );
}
