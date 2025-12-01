import styles from './Header.module.css';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenImport: () => void;
}

export function Header({ isDark, onToggleTheme, onOpenGuide, onOpenSettings, onOpenImport }: HeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>QuickReport</h1>

      <div className={styles.actions}>
        <button
          className={styles.button}
          onClick={onOpenImport}
          aria-label="데이터 불러오기"
          data-testid="import-button"
          data-tour="import"
        >
          불러오기
        </button>

        <button
          className={styles.button}
          onClick={onOpenSettings}
          aria-label="형식 설정 열기"
          data-testid="settings-button"
          data-tour="settings"
        >
          설정
        </button>

        <button
          className={styles.button}
          onClick={onOpenGuide}
          aria-label="문법 가이드 열기"
          data-testid="guide-button"
          data-tour="guide"
        >
          가이드
        </button>

        <button
          className={styles.button}
          onClick={onToggleTheme}
          aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          aria-pressed={isDark}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
