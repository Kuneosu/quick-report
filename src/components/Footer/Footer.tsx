import styles from './Footer.module.css';

interface FooterProps {
  savedAt: Date | null;
  onClear: () => void;
}

export function Footer({ savedAt, onClear }: FooterProps) {
  const formatSavedTime = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <button
        className={styles.clearButton}
        onClick={onClear}
        aria-label="새로 작성"
      >
        🗑️ 새로 작성
      </button>

      <div className={styles.status} aria-live="polite">
        {savedAt && (
          <span className={styles.saveStatus}>
            ✓ 자동 저장됨 {formatSavedTime(savedAt)}
          </span>
        )}
      </div>
    </footer>
  );
}
