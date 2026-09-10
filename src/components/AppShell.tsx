import type { ReactNode } from 'react';
import { useI18n } from '../i18n/I18nContext.tsx';

interface AppShellProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

/** Osnovni okvir stranice: preskakanje na sadržaj, zaglavlje, glavni sadržaj, podnožje. */
export function AppShell({ header, footer, children }: AppShellProps) {
  const { t } = useI18n();

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        {t('app.skipToContent')}
      </a>
      {header}
      <main id="main-content">{children}</main>
      {footer}
    </div>
  );
}
