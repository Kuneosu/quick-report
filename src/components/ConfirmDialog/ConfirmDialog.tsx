import { useEffect, useCallback } from 'react';
import styles from './ConfirmDialog.module.css';

interface ThirdAction {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  thirdAction?: ThirdAction;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
  confirmVariant = 'danger',
  thirdAction,
}: ConfirmDialogProps) {
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

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      data-testid="dialog-backdrop"
    >
      <div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <h2 id="dialog-title" className={styles.title}>
          {title}
        </h2>
        <p id="dialog-message" className={styles.message}>
          {message}
        </p>
        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          {thirdAction && (
            <button
              className={thirdAction.variant === 'primary' ? styles.primaryButton : styles.secondaryButton}
              onClick={thirdAction.onClick}
            >
              {thirdAction.text}
            </button>
          )}
          <button
            className={confirmVariant === 'primary' ? styles.primaryButton : styles.confirmButton}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
