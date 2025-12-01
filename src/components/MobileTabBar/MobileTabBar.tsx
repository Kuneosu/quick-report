import { useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import styles from './MobileTabBar.module.css';

export type TabType = 'editor' | 'preview';

interface MobileTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, currentTab: TabType) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const nextTab = currentTab === 'editor' ? 'preview' : 'editor';
        onTabChange(nextTab);
      }
    },
    [onTabChange]
  );

  return (
    <div className={styles.tabBar} role="tablist" aria-label="콘텐츠 탭">
      <button
        role="tab"
        aria-selected={activeTab === 'editor'}
        aria-controls="editor-panel"
        className={`${styles.tab} ${activeTab === 'editor' ? styles.active : ''}`}
        onClick={() => onTabChange('editor')}
        onKeyDown={(e) => handleKeyDown(e, 'editor')}
        tabIndex={activeTab === 'editor' ? 0 : -1}
      >
        입력
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'preview'}
        aria-controls="preview-panel"
        className={`${styles.tab} ${activeTab === 'preview' ? styles.active : ''}`}
        onClick={() => onTabChange('preview')}
        onKeyDown={(e) => handleKeyDown(e, 'preview')}
        tabIndex={activeTab === 'preview' ? 0 : -1}
      >
        결과
      </button>
    </div>
  );
}
