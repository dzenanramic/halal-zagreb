import { useI18n } from '../i18n/I18nContext.tsx';
import type { Catalog } from '../data/types.ts';

interface AboutSectionProps {
  catalog: Catalog | null;
  sourceLabel: string;
}

/** O projektu: konkretno objašnjenje izvora, opsega i ograničenja. */
export function AboutSection({ catalog, sourceLabel }: AboutSectionProps) {
  const { t, formatNumber } = useI18n();

  return (
    <section className="about section" id="o-projektu" aria-labelledby="about-title">
      <div className="container">
        <h2 className="section__title" id="about-title">
          {t('about.title')}
        </h2>

        <div className="about__grid">
          <div className="about__text">
            <p>{t('about.p1')}</p>
            <p>{t('about.p2')}</p>
            <p>{t('about.p3')}</p>
            <p>{t('about.p4')}</p>
          </div>

          <div className="about__facts">
            <h3 className="about__facts-title">{t('about.scopeTitle')}</h3>
            <ul className="about__facts-list">
              <li>{t('about.scopeSource', { file: sourceLabel, rows: catalog?.sourceRows ?? 0 })}</li>
              {catalog !== null ? (
                <>
                  <li>
                    {t('about.scopeRegion', {
                      total: formatNumber(catalog.counts.total),
                      city: formatNumber(catalog.counts.city),
                      wider: formatNumber(catalog.counts.wider),
                    })}
                  </li>
                  <li>
                    {t('about.scopeExcluded', {
                      count: formatNumber(catalog.excluded.length),
                    })}
                  </li>
                </>
              ) : null}
              <li>{t('about.scopeMethod')}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
