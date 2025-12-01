import styles from './Preview.module.css';

interface PreviewProps {
  content: string;
}

export function Preview({ content }: PreviewProps) {
  const isEmpty = content.trim() === '';

  return (
    <div
      className={styles.container}
      role="region"
      aria-label="변환 결과"
      aria-live="polite"
      data-testid="preview"
    >
      {isEmpty ? (
        <p className={styles.placeholder}>
          마크다운을 입력하면 여기에 변환 결과가 표시됩니다.
        </p>
      ) : (
        <pre className={styles.content}>{content}</pre>
      )}
    </div>
  );
}
