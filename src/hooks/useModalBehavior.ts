/**
 * Ponašanje modalnih slojeva (drawer s filterima, detalji lokacije):
 *  - Escape zatvara,
 *  - fokus ostaje unutar sloja (Tab / Shift+Tab),
 *  - fokus se vraća na element koji je sloj otvorio,
 *  - pozadina se ne pomiče dok je sloj otvoren.
 */

import { useEffect, type RefObject } from 'react';

export interface ElementRefLike {
  readonly current: HTMLElement | null;
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) =>
      element.offsetParent !== null || element === document.activeElement,
  );
}

export interface ModalBehaviorOptions {
  active: boolean;
  onClose: () => void;
  container: ElementRefLike;
  /** Element na koji se vraća fokus nakon zatvaranja. */
  returnFocusTo?: RefObject<HTMLElement | null>;
}

export function useModalBehavior({ active, onClose, container, returnFocusTo }: ModalBehaviorOptions): void {
  useEffect(() => {
    if (!active) return;

    const previouslyFocused = document.activeElement;
    const element = container.current;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    const initial = element ? focusableElements(element)[0] : null;
    if (initial) {
      initial.focus();
    } else if (element) {
      element.focus();
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !element) return;

      const focusable = focusableElements(element);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (first === undefined || last === undefined) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      body.style.overflow = previousOverflow;

      const target = returnFocusTo?.current ?? (previouslyFocused as HTMLElement | null);
      if (target && typeof target.focus === 'function') {
        target.focus();
      }
    };
  }, [active, onClose, container, returnFocusTo]);
}
