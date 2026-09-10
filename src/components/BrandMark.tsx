/**
 * Znak aplikacije: jednostavan geometrijski motiv (osmokraka zvijezda u
 * kvadratu) izrađen u SVG-u. Nije logotip neke organizacije.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16 5.5l3.4 7.1 7.1 3.4-7.1 3.4L16 26.5l-3.4-7.1L5.5 16l7.1-3.4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
