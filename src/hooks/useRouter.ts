/**
 * Minimalni router na temelju hasha.
 *
 * Rute:
 *   #/                 - početna (uvod, popis lokacija, o projektu)
 *   #/lokacije         - skok na popis lokacija
 *   #/o-projektu       - skok na sekciju o projektu
 *   #/lokacija/<id>    - otvoreni detalji lokacije (side panel / modal)
 *
 * Hash routing je odabran jer radi i bez poslužiteljskih pravila za SPA
 * (npr. kod statičnog hostanja ili otvaranja izgradnje s diska), a detalji su
 * time i dalje dijeljivi putem poveznice.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'locations' }
  | { name: 'about' }
  | { name: 'location'; id: string };

const LOCATION_PREFIX = '#/lokacija/';

export function parseHash(hash: string): Route {
  const normalized = hash.replace(/^#/, '');

  if (normalized.startsWith('/lokacija/')) {
    const id = decodeURIComponent(normalized.slice('/lokacija/'.length));
    return id === '' ? { name: 'locations' } : { name: 'location', id };
  }

  if (normalized === '/lokacije') return { name: 'locations' };
  if (normalized === '/o-projektu') return { name: 'about' };
  return { name: 'home' };
}

export interface Router {
  route: Route;
  /** Navigacija na hash putanju (npr. "#/o-projektu"). */
  navigate: (hash: string) => void;
  openLocation: (id: string) => void;
  /** Zatvara detalje i vraća se na prethodni prikaz kada je to moguće. */
  closeLocation: () => void;
}

export function useRouter(): Router {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  /** Koliko je koraka aplikacija sama dodala u povijest preglednika. */
  const ownDepth = useRef(0);

  useEffect(() => {
    const sync = (): void => {
      setRoute(parseHash(window.location.hash));
    };

    const onPopState = (): void => {
      ownDepth.current = Math.max(0, ownDepth.current - 1);
      sync();
    };

    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const navigate = useCallback((hash: string) => {
    if (window.location.hash === hash) {
      setRoute(parseHash(hash));
      return;
    }
    window.history.pushState(null, '', hash);
    ownDepth.current += 1;
    setRoute(parseHash(hash));
  }, []);

  const openLocation = useCallback(
    (id: string) => {
      navigate(`${LOCATION_PREFIX}${encodeURIComponent(id)}`);
    },
    [navigate],
  );

  const closeLocation = useCallback(() => {
    if (ownDepth.current > 0) {
      window.history.back();
      return;
    }
    navigate('#/lokacije');
  }, [navigate]);

  return { route, navigate, openLocation, closeLocation };
}
