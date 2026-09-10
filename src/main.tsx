import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { I18nProvider } from './i18n/I18nContext.tsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

const container = document.getElementById('root');

if (container === null) {
  throw new Error('Element #root nije pronađen u index.html.');
}

createRoot(container).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
