import { useState } from 'react';
import { useClipboard } from '../../hooks/useClipboard';
import styles from './CopyButton.module.css';

interface CopyButtonProps {
  text: string;
  onCopySuccess: () => void;
  onCopyError?: () => void;
  disabled?: boolean;
}

export function CopyButton({ text, onCopySuccess, onCopyError, disabled }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { copy } = useClipboard();

  const handleClick = async () => {
    const success = await copy(text);

    if (success) {
      setCopied(true);
      onCopySuccess();

      // 1.5초 후 상태 복구
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } else {
      onCopyError?.();
    }
  };

  return (
    <button
      className={`${styles.iconButton} ${copied ? styles.copied : ''}`}
      onClick={handleClick}
      disabled={disabled}
      title={copied ? '복사 완료' : '복사'}
      aria-label={copied ? '복사 완료' : '결과 복사'}
      data-tour="copy"
      data-testid="copy-button"
    >
      {copied ? '✓' : '⎘'}
    </button>
  );
}
