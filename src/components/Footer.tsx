import { useI18n } from '../i18n/I18nContext.tsx';
import { NavLink } from './NavLink.tsx';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';
import { BrandMark } from './BrandMark.tsx';
import { APP_VERSION } from '../config.ts';

interface FooterProps {
  sourceLabel: string;
  onNavigate: (href: string) => void;
}

export function Footer({ sourceLabel, onNavigate }: FooterProps) {
  const { t } = useI18n();

  return (
    <footer className="site-footer on-dark">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <div className="site-footer__brand">
              <BrandMark className="brand__mark" />
              <span className="site-footer__name">{t('app.name')}</span>
            </div>
            <p className="site-footer__note">{t('footer.sourceNote', { file: sourceLabel })}</p>
          </div>

          <nav aria-label={t('footer.navigation')}>
            <h2 className="eyebrow">{t('footer.navigation')}</h2>
            <ul className="site-footer__list">
              <li>
                <NavLink
                  href="#/lokacije"
                  className="site-footer__link"
                  current={false}
                  onNavigate={onNavigate}
                >
                  {t('nav.locations')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  href="#/o-projektu"
                  className="site-footer__link"
                  current={false}
                  onNavigate={onNavigate}
                >
                  {t('nav.about')}
                </NavLink>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow">{t('footer.language')}</h2>
            <div className="site-footer__list">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>{t('footer.disclaimer')}</p>
          <p>
            {t('app.name')} · {APP_VERSION}
          </p>
        </div>
      </div>
    </footer>
  );
}
