import styles from './Preview.module.css';
import { useClipboard } from '../../hooks/useClipboard';

interface PreviewProps {
  content: string;
  onCopySuccess?: () => void;
}

export function Preview({ content, onCopySuccess }: PreviewProps) {
  const isEmpty = content.trim() === '';
  const { copy } = useClipboard();

  const handleSectionClick = async (text: string) => {
    const success = await copy(text);
    if (success && onCopySuccess) {
      onCopySuccess();
    }
  };

  // ▶ 단위로 섹션 분리
  const sections = (() => {
    const lines = content.split('\n');
    const result: string[] = [];
    let currentSection: string[] = [];

    for (const line of lines) {
      if (line.trim().startsWith('▶')) {
        if (currentSection.length > 0) {
          result.push(currentSection.join('\n'));
        }
        currentSection = [line];
      } else {
        currentSection.push(line);
      }
    }
    if (currentSection.length > 0) {
      result.push(currentSection.join('\n'));
    }
    return result;
  })();

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
        <div className={styles.content}>
          {sections.map((section, index) => (
            <div
              key={index}
              className={styles.section}
              onClick={() => handleSectionClick(section)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSectionClick(section);
                }
              }}
              aria-label="클릭하여 섹션 복사"
              title="클릭하여 복사"
            >
              {section}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
