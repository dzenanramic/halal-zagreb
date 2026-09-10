/**
 * Ornamentalni elementi: osmokraka zvijezda koja se koristi kao diskretan
 * geometrijski detalj (razdjelnik sekcija, oznaka praznog stanja).
 * Uvijek je dekorativna (aria-hidden) - nikad ne nosi značenje.
 */
export function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
        <path d="M12 2.5l2.6 6.9 6.9 2.6-6.9 2.6L12 21.5l-2.6-6.9L2.5 12l6.9-2.6z" />
        <path d="M12 6.8l1.4 3.8 3.8 1.4-3.8 1.4L12 17.2l-1.4-3.8L6.8 12l3.8-1.4z" />
      </g>
    </svg>
  );
}
