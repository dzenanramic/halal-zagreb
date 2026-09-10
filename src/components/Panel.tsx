import { useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useModalBehavior } from '../hooks/useModalBehavior.ts';

interface PanelProps {
  open: boolean;
  titleId: string;
  title: string;
  eyebrow: string;
  closeLabel: string;
  closeHint: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Klizni panel (detalji lokacije, filteri na mobitelu).
 * Na mobitelu izlazi s donjeg ruba, na širokim ekranima s desne strane.
 * Fokus ostaje unutar panela, Escape ga zatvara, pozadina se ne pomiče.
 */
export function Panel({
  open,
  titleId,
  title,
  eyebrow,
  closeLabel,
  closeHint,
  onClose,
  children,
  footer,
}: PanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useModalBehavior({ active: open, onClose, container: panelRef });

  if (!open) return null;

  return (
    <>
      <div className="backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className="panel__header">
          <div className="panel__heading">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="panel__title" id={titleId}>
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="panel__close"
            onClick={onClose}
            aria-label={`${closeLabel} (${closeHint})`}
            title={closeHint}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="panel__body">{children}</div>

        {footer !== undefined ? <div className="panel__footer">{footer}</div> : null}
      </div>
    </>
  );
}
