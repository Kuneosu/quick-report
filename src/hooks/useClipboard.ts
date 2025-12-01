import { useCallback } from 'react';

interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  supported: boolean;
}

/**
 * 클립보드 복사 기능을 제공하는 훅
 * Clipboard API를 사용하며, 실패 시 false 반환
 */
export function useClipboard(): UseClipboardReturn {
  const supported = typeof navigator !== 'undefined' && !!navigator.clipboard;

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!supported) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, [supported]);

  return { copy, supported };
}
