import { useI18n } from '../i18n/I18nContext.tsx';
import type { MissingField } from '../data/types.ts';

interface IncompleteDataBadgeProps {
  fields: MissingField[];
}

/**
 * Neutralna oznaka za zapise kojima u registru nedostaje neko polje.
 * Ne tvrdi da podatak ne postoji - samo da nije naveden u izvoru.
 */
export function IncompleteDataBadge({ fields }: IncompleteDataBadgeProps) {
  const { t, missingFieldsLabel } = useI18n();

  if (fields.length === 0) return null;

  return (
    <span
      className="tag tag--missing"
      title={t('card.incompleteHint', { fields: missingFieldsLabel(fields) })}
    >
      <span className="tag__dot" aria-hidden="true" />
      {t('card.incomplete')}
    </span>
  );
}
