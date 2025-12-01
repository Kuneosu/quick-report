import styles from './Header.module.css';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
}

export function Header({ isDark, onToggleTheme, onOpenGuide, onOpenSettings }: HeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>MD → Report</h1>

      <div className={styles.actions}>
        <button
          className={styles.button}
          onClick={onOpenSettings}
          aria-label="형식 설정 열기"
          data-testid="settings-button"
        >
          설정
        </button>

        <button
          className={styles.button}
          onClick={onOpenGuide}
          aria-label="문법 가이드 열기"
        >
          ? 가이드
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
