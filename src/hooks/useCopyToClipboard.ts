/**
 * Kopiranje teksta u međuspremnik.
 * Koristi Clipboard API kada je dostupan, uz lokalni fallback preko
 * skrivenog polja za unos (radi i bez dozvole za clipboard).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type CopyStatus = 'idle' | 'copied' | 'failed';

function legacyCopy(value: string): boolean {
  try {
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const succeeded = document.execCommand('copy');
    document.body.removeChild(area);
    return succeeded;
  } catch {
    return false;
  }
}

export interface ClipboardController {
  status: CopyStatus;
  copy: (value: string) => void;
}

export function useCopyToClipboard(resetAfterMs = 2500): ClipboardController {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  const copy = useCallback(
    (value: string) => {
      const finish = (next: CopyStatus): void => {
        setStatus(next);
        if (timer.current !== null) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setStatus('idle'), resetAfterMs);
      };

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(value).then(
          () => finish('copied'),
          () => finish(legacyCopy(value) ? 'copied' : 'failed'),
        );
        return;
      }

      finish(legacyCopy(value) ? 'copied' : 'failed');
    },
    [resetAfterMs],
  );

  return { status, copy };
}
