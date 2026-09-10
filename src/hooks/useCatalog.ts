/**
 * Učitavanje kataloga s jasnim stanjima: loading / ready / error.
 * Sadrži i funkciju za ponovni pokušaj koju koristi error stanje.
 */

import { useCallback, useEffect, useState } from 'react';
import { loadCatalog, type CatalogSource } from '../data/loadCatalog.ts';
import { DatasetError } from '../data/errors.ts';
import type { Catalog, DatasetErrorInfo } from '../data/types.ts';

export type CatalogState =
  | { status: 'loading' }
  | { status: 'ready'; catalog: Catalog; source: CatalogSource; excludedCount: number }
  | { status: 'error'; error: DatasetErrorInfo };

function toErrorInfo(error: unknown): DatasetErrorInfo {
  if (error instanceof DatasetError) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof Error) {
    return { code: 'unknown', message: error.message };
  }
  return { code: 'unknown', message: 'Nepoznata greška.' };
}

export interface CatalogController {
  state: CatalogState;
  reload: () => void;
}

export function useCatalog(): CatalogController {
  const [state, setState] = useState<CatalogState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    loadCatalog()
      .then(({ catalog, source }) => {
        if (cancelled) return;
        setState({
          status: 'ready',
          catalog,
          source,
          excludedCount: catalog.excluded.length,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({ status: 'error', error: toErrorInfo(error) });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  return { state, reload };
}
