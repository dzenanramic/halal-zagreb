import { Menu, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.tsx';
import { NavLink } from './NavLink.tsx';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';
import { BrandMark } from './BrandMark.tsx';
import type { Route } from '../hooks/useRouter.ts';

interface HeaderProps {
  route: Route;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onNavigate: (href: string) => void;
}

export function Header({ route, menuOpen, onMenuToggle, onNavigate }: HeaderProps) {
  const { t } = useI18n();

  const onLocations = route.name === 'locations' || route.name === 'location';
  const onAbout = route.name === 'about';

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a
          className="brand"
          href="#/"
          onClick={(event) => {
            event.preventDefault();
            onNavigate('#/');
          }}
        >
          <BrandMark className="brand__mark" />
          <span className="brand__name">{t('app.name')}</span>
          <span className="brand__tagline">{t('app.tagline')}</span>
        </a>

        <nav className="site-nav" aria-label={t('nav.locations')}>
          <ul className="site-nav__list">
            <li>
              <NavLink
                href="#/lokacije"
                className="nav-link"
                current={onLocations}
                onNavigate={onNavigate}
              >
                {t('nav.locations')}
              </NavLink>
            </li>
            <li>
              <NavLink href="#/o-projektu" className="nav-link" current={onAbout} onNavigate={onNavigate}>
                {t('nav.about')}
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <LanguageSwitcher />
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={onMenuToggle}
          >
            {menuOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
            <span className="visually-hidden">
              {menuOpen ? t('nav.closeMenu') : t('nav.menu')}
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav className="mobile-menu" id="mobile-menu" aria-label={t('nav.menu')}>
          <div className="container">
            <ul className="mobile-menu__list">
              <li>
                <NavLink
                  href="#/lokacije"
                  className="mobile-menu__link"
                  current={onLocations}
                  onNavigate={onNavigate}
                  onActivate={onMenuToggle}
                >
                  {t('nav.locations')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  href="#/o-projektu"
                  className="mobile-menu__link"
                  current={onAbout}
                  onNavigate={onNavigate}
                  onActivate={onMenuToggle}
                >
                  {t('nav.about')}
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
