import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './NameInputDialog.module.css';

interface NameInputDialogProps {
  isOpen: boolean;
  defaultValue?: string;
  placeholder?: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function NameInputDialog({
  isOpen,
  defaultValue = '',
  placeholder = '문서 이름 입력...',
  onSave,
  onCancel,
}: NameInputDialogProps) {
  const [name, setName] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // 다이얼로그 열릴 때 초기화 및 포커스
  useEffect(() => {
    if (isOpen) {
      setName(defaultValue);
      // 약간의 지연 후 포커스 (애니메이션 고려)
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, defaultValue]);

  // ESC 키 핸들러
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    },
    [onCancel]
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
      onCancel();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name.trim());
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(name.trim());
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      data-testid="name-dialog-backdrop"
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-dialog-title"
      >
        <h2 id="name-dialog-title" className={styles.title}>
          문서 저장
        </h2>
        <form onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="document-name">
            문서 이름
          </label>
          <input
            ref={inputRef}
            id="document-name"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            data-testid="name-input"
          />
          <p className={styles.hint}>
            비워두면 첫 줄이 이름으로 사용됩니다
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.saveButton}
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
