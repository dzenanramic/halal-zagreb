import type { ReactNode } from 'react';
import { useI18n } from '../i18n/I18nContext.tsx';
import { Panel } from './Panel.tsx';

interface FilterDrawerProps {
  open: boolean;
  resultCount: number;
  onClose: () => void;
  children: ReactNode;
}

/** Drawer s filterima za mobilne ekrane. */
export function FilterDrawer({ open, resultCount, onClose, children }: FilterDrawerProps) {
  const { t, formatNumber } = useI18n();

  return (
    <Panel
      open={open}
      titleId="filter-drawer-title"
      eyebrow={t('locations.title')}
      title={t('filters.title')}
      closeLabel={t('filters.close')}
      closeHint={t('details.closeHint')}
      onClose={onClose}
      footer={
        <button type="button" className="btn btn--primary btn--full" onClick={onClose}>
          {t('filters.showResults')} ({formatNumber(resultCount)})
        </button>
      }
    >
      {children}
    </Panel>
  );
}
