/**
 * Znak aplikacije: osmokraka zvijezda (khatam) u oktogonu.
 * Nije logotip nijedne organizacije - vlastiti geometrijski znak projekta.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
        <path d="M10.2 2h11.6L30 10.2v11.6L21.8 30H10.2L2 21.8V10.2z" />
        <path d="M16 6.6l2.7 6.7 6.7 2.7-6.7 2.7L16 25.4l-2.7-6.7L6.6 16l6.7-2.7z" />
      </g>
      <circle cx="16" cy="16" r="1.4" fill="currentColor" />
    </svg>
  );
}
