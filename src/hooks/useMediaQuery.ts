import { useEffect, useState } from 'react';

/** Prati CSS media query, npr. useMediaQuery('(min-width: 1024px)'). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const list = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => {
      list.removeEventListener('change', onChange);
    };
  }, [query]);

  return matches;
}
