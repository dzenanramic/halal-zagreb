import { useI18n } from "../i18n/I18nContext.tsx";
import { StarIcon } from "./Ornament.tsx";

interface PageIntroProps {
  /** Stvarni brojevi iz učitanog kataloga; null dok se podaci učitavaju. */
  counts: { total: number; city: number; wider: number } | null;
}

/**
 * Uvod stranice bez hero sekcije: naslov, jedna rečenica o izvoru podataka i
 * stvarni brojevi iz kataloga. Zauzima malo visine i ne ponavlja sadržaj
 * popisa koji slijedi.
 */
export function PageIntro({ counts }: PageIntroProps) {
  const { t, formatNumber } = useI18n();

  return (
    <section className="intro" aria-labelledby="page-title">
      <div className="container intro__inner">
        <div className="intro__lead">
          {/* <p className="eyebrow">{t("intro.eyebrow")}</p> */}
          <h1 className="intro__title" id="page-title">
            {t("intro.title")}
          </h1>
          <p className="intro__note">{t("intro.note")}</p>
        </div>

        {counts !== null ? (
          <dl className="stats">
            <div className="stat">
              <dt className="stat__label">{t("stats.total")}</dt>
              <dd className="stat__value">{formatNumber(counts.total)}</dd>
            </div>
            <div className="stat">
              <dt className="stat__label">{t("stats.city")}</dt>
              <dd className="stat__value">{formatNumber(counts.city)}</dd>
            </div>
            <div className="stat">
              <dt className="stat__label">{t("stats.wider")}</dt>
              <dd className="stat__value">{formatNumber(counts.wider)}</dd>
            </div>
          </dl>
        ) : null}
      </div>

      <span className="intro__divider" aria-hidden="true">
        <StarIcon />
      </span>
    </section>
  );
}
