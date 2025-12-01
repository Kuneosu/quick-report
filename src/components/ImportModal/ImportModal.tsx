import { useState, useEffect, useCallback, useRef } from 'react';
import { useImportConvert } from './useImportConvert';
import styles from './ImportModal.module.css';

type ViewState = 'input' | 'preview';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (text: string, mode: 'overwrite' | 'append' | 'prepend') => void;
  hasExistingContent: boolean;
}

const PLACEHOLDER = `▶ 프로젝트명
  - 활동명
    + 작업내용
      . 세부내용

또는

# 프로젝트명
## 활동명
### 작업내용
#### 세부내용`;

export function ImportModal({ isOpen, onClose, onApply, hasExistingContent }: ImportModalProps) {
  const {
    inputText,
    setInputText,
    convertedText,
    stats,
    isConverting,
    convert,
    reset,
    inputStats,
  } = useImportConvert();

  const [viewState, setViewState] = useState<ViewState>('input');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 모달 열릴 때 초기화 및 포커스
  useEffect(() => {
    if (isOpen) {
      setViewState('input');
      // 포커스 설정
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else {
      reset();
    }
  }, [isOpen, reset]);

  // ESC 키 핸들러
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      // Ctrl/Cmd + Enter로 변환
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (viewState === 'input' && inputText.trim()) {
          convert();
          setViewState('preview');
        }
      }
    },
    [onClose, inputText, convert, viewState]
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

  const handleConvert = () => {
    convert();
    setViewState('preview');
  };

  const handleBack = () => {
    setViewState('input');
  };

  const handleApply = (mode: 'overwrite' | 'append' | 'prepend') => {
    onApply(convertedText, mode);
    onClose();
  };

  const isInputView = viewState === 'input';
  const isPreviewView = viewState === 'preview';

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      data-testid="import-modal-backdrop"
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
        aria-describedby="import-modal-description"
      >
        <header className={styles.header}>
          <div>
            <h2 id="import-modal-title" className={styles.title}>
              데이터 불러오기
            </h2>
            <p id="import-modal-description" className={styles.description}>
              기존 보고서 형식의 데이터를 마크다운으로 변환합니다.
            </p>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </header>

        <div className={styles.content}>
          {isInputView && (
            <div className={styles.inputPanel}>
              <label htmlFor="import-textarea" className={styles.label}>
                기존 보고서 데이터를 붙여넣기 하세요
              </label>
              <span id="input-hint" className={styles.hint}>
                ▶, -, +, . 형식 또는 #, ##, ###, #### 형식 지원
              </span>
              <textarea
                ref={textareaRef}
                id="import-textarea"
                className={styles.textarea}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={PLACEHOLDER}
                aria-describedby="input-hint"
                spellCheck={false}
              />
              <div className={styles.inputInfo}>
                <span>라인: {inputStats.lines}</span>
                <span>문자: {inputStats.chars}</span>
              </div>
            </div>
          )}

          {isPreviewView && (
            <div className={styles.previewPanel}>
              <div className={styles.previewHeader}>
                <div className={styles.tabs}>
                  <button
                    className={styles.tabInactive}
                    onClick={handleBack}
                  >
                    입력
                  </button>
                  <button className={styles.tabActive}>미리보기</button>
                </div>
                <div className={styles.statsPanel}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>프로젝트</span>
                    <span className={styles.statValue}>{stats.projects}개</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>그룹핑</span>
                    <span className={styles.statValue}>{stats.groupings}건</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>중복제거</span>
                    <span className={styles.statValue}>{stats.duplicatesRemoved}건</span>
                  </div>
                </div>
              </div>
              <pre className={styles.previewContent}>{convertedText || '(변환된 내용이 없습니다)'}</pre>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          {isInputView && (
            <>
              <button className={styles.cancelButton} onClick={onClose}>
                취소
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleConvert}
                disabled={!inputText.trim() || isConverting}
              >
                {isConverting ? '변환 중...' : '변환 미리보기'}
              </button>
            </>
          )}

          {isPreviewView && (
            <>
              <button className={styles.backButton} onClick={handleBack}>
                뒤로
              </button>
              <button className={styles.cancelButton} onClick={onClose}>
                취소
              </button>
              {hasExistingContent ? (
                <div className={styles.applyGroup}>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => handleApply('append')}
                  >
                    뒤에 추가
                  </button>
                  <button
                    className={styles.primaryButton}
                    onClick={() => handleApply('overwrite')}
                  >
                    덮어쓰기
                  </button>
                </div>
              ) : (
                <button
                  className={styles.primaryButton}
                  onClick={() => handleApply('overwrite')}
                >
                  에디터에 적용
                </button>
              )}
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
