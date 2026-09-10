import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppShell } from './components/AppShell.tsx';
import { Header } from './components/Header.tsx';
import { HeroSearch } from './components/HeroSearch.tsx';
import { SearchControls } from './components/SearchControls.tsx';
import { FilterPanel } from './components/FilterPanel.tsx';
import { FilterDrawer } from './components/FilterDrawer.tsx';
import { ActiveFilters } from './components/ActiveFilters.tsx';
import { LocationList } from './components/LocationList.tsx';
import { LocationDetails } from './components/LocationDetails.tsx';
import { EmptyState } from './components/EmptyState.tsx';
import { ErrorState } from './components/ErrorState.tsx';
import { LoadingState } from './components/LoadingState.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { Footer } from './components/Footer.tsx';
import { useCatalog } from './hooks/useCatalog.ts';
import { useRouter } from './hooks/useRouter.ts';
import { useLocationQuery } from './hooks/useLocationQuery.ts';
import { useMediaQuery } from './hooks/useMediaQuery.ts';
import { useI18n } from './i18n/I18nContext.tsx';
import { DATA_FILE_NAME } from './config.ts';
import type { CategorySummary, Location, RegionSummary } from './data/types.ts';

const EMPTY_LOCATIONS: Location[] = [];
const EMPTY_CATEGORIES: CategorySummary[] = [];
const EMPTY_REGIONS: RegionSummary[] = [];

const WIDE_LAYOUT = '(min-width: 1024px)';

function scrollToSection(id: string): void {
  const element = document.getElementById(id);
  if (element === null) return;

  const reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

export function App() {
  const { t, language } = useI18n();
  const { state, reload } = useCatalog();
  const { route, navigate, openLocation, closeLocation } = useRouter();
  const isWideLayout = useMediaQuery(WIDE_LAYOUT);

  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const catalog = state.status === 'ready' ? state.catalog : null;
  const locations = catalog?.locations ?? EMPTY_LOCATIONS;
  const categories = catalog?.categories ?? EMPTY_CATEGORIES;
  const regions = catalog?.regions ?? EMPTY_REGIONS;
  const sourceLabel = state.status === 'ready' ? state.source.label : DATA_FILE_NAME;

  const query = useLocationQuery(locations, categories);

  const heroCounts = useMemo(
    () =>
      catalog === null
        ? null
        : {
            total: catalog.counts.total,
            city: catalog.counts.city,
            wider: catalog.counts.wider,
          },
    [catalog],
  );

  const activeLocation =
    route.name === 'location'
      ? (locations.find((location) => location.id === route.id) ?? null)
      : null;

  // Naslov dokumenta prati jezik.
  useEffect(() => {
    document.title = `${t('app.name')} - ${t('app.tagline')}`;
  }, [t, language]);

  // Navigacija na sekcije (Lokacije / O projektu) pomiče prikaz na sekciju.
  useEffect(() => {
    if (route.name === 'locations') scrollToSection('lokacije');
    else if (route.name === 'about') scrollToSection('o-projektu');
  }, [route]);

  // Mobilni izbornik se zatvara pri promjeni rute.
  useEffect(() => {
    setMenuOpen(false);
  }, [route]);

  // Drawer s filterima nema smisla na širokom rasporedu.
  useEffect(() => {
    if (isWideLayout) setFiltersOpen(false);
  }, [isWideLayout]);

  const filterPanelProps = {
    regions,
    categories,
    region: query.state.region,
    category: query.state.category,
    activeFilterCount: query.activeFilterCount,
    onRegionChange: query.setRegion,
    onCategoryChange: query.setCategory,
    onClearAll: query.clearAll,
  };

  let results: ReactNode;
  if (state.status === 'loading') {
    results = <LoadingState />;
  } else if (state.status === 'error') {
    results = <ErrorState info={state.error} onRetry={reload} />;
  } else if (query.results.length === 0) {
    results = <EmptyState onClearAll={query.clearAll} />;
  } else {
    results = <LocationList locations={query.results} onOpen={openLocation} />;
  }

  return (
    <AppShell
      header={
        <Header
          route={route}
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((open) => !open)}
          onNavigate={navigate}
        />
      }
      footer={<Footer sourceLabel={sourceLabel} onNavigate={navigate} />}
    >
      <HeroSearch
        query={query.state.query}
        onQueryChange={query.setQuery}
        counts={heroCounts}
      />

      <section className="section" id="lokacije" aria-labelledby="locations-title">
        <div className="container">
          <h2 className="section__title" id="locations-title">
            {t('locations.title')}
          </h2>

          <div className="locations__layout">
            <div className="filters" aria-labelledby="sidebar-filters-title">
              <FilterPanel idPrefix="sidebar" {...filterPanelProps} />
            </div>

            <div className="locations__main">
              <SearchControls
                resultCount={query.results.length}
                query={query.state.query}
                sort={query.state.sort}
                activeFilterCount={query.activeFilterCount}
                onSortChange={query.setSort}
                onOpenFilters={() => setFiltersOpen(true)}
              />
              <ActiveFilters filters={query.activeFilters} onClearAll={query.clearAll} />
              {results}
            </div>
          </div>
        </div>
      </section>

      <AboutSection catalog={catalog} sourceLabel={sourceLabel} />

      {route.name === 'location' && state.status === 'ready' ? (
        <LocationDetails
          location={activeLocation}
          sourceFile={sourceLabel}
          onClose={closeLocation}
        />
      ) : null}

      <FilterDrawer
        open={filtersOpen}
        resultCount={query.results.length}
        onClose={() => setFiltersOpen(false)}
      >
        <FilterPanel idPrefix="drawer" {...filterPanelProps} />
      </FilterDrawer>
    </AppShell>
  );
}
