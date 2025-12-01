import { useEffect, useCallback } from 'react';
import styles from './GuideModal.module.css';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

const GUIDE_ITEMS = [
  { syntax: '# 제목', result: '▶ 프로젝트명', description: '최상위 제목' },
  { syntax: '## 항목', result: '  - 카테고리', description: '2칸 들여쓰기' },
  { syntax: '### 세부', result: '    + 세부 항목', description: '4칸 들여쓰기' },
  { syntax: '#### 하위', result: '      . 하위 세부사항', description: '6칸 들여쓰기' },
];

export function GuideModal({ isOpen, onClose, onStartTour }: GuideModalProps) {
  // ESC 키 핸들러
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      data-testid="modal-backdrop"
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        <header className={styles.header}>
          <h2 id="guide-title" className={styles.title}>
            마크다운 문법 가이드
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </header>

        <div className={styles.content}>
          <p className={styles.subtitle}>지원하는 문법</p>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>마크다운</th>
                <th>변환 결과</th>
                <th>설명</th>
              </tr>
            </thead>
            <tbody>
              {GUIDE_ITEMS.map((item) => (
                <tr key={item.syntax}>
                  <td><code>{item.syntax}</code></td>
                  <td><code>{item.result}</code></td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.tip}>
            <strong>💡 팁:</strong> 헤딩 뒤에 바로 텍스트를 입력하면 해당 레벨의 항목으로 변환됩니다.
          </div>
        </div>

        <footer className={styles.footer}>
          {onStartTour && (
            <button className={styles.tourButton} onClick={onStartTour}>
              가이드 다시 보기
            </button>
          )}
          <button className={styles.confirmButton} onClick={onClose}>
            확인
          </button>
        </footer>
      </div>
    </div>
  );
}
