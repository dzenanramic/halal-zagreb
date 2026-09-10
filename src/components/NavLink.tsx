import type { MouseEvent, ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  current: boolean;
  className: string;
  onNavigate: (href: string) => void;
  onActivate?: () => void;
  children: ReactNode;
}

/**
 * Poveznica koja izgleda i ponaša se kao obična <a> (radi srednji klik,
 * otvaranje u novom tabu, kopiranje adrese), ali unutar aplikacije navigira
 * bez ponovnog učitavanja stranice.
 */
export function NavLink({
  href,
  current,
  className,
  onNavigate,
  onActivate,
  children,
}: NavLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    onActivate?.();
    onNavigate(href);
  };

  return (
    <a
      href={href}
      className={className}
      aria-current={current ? 'true' : undefined}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
