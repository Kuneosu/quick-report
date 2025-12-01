import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../useClipboard';

describe('useClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Clipboard API 지원 시', () => {
    it('copy 함수가 제공된다', () => {
      const { result } = renderHook(() => useClipboard());
      expect(result.current.copy).toBeDefined();
      expect(typeof result.current.copy).toBe('function');
    });

    it('supported가 true이다', () => {
      const { result } = renderHook(() => useClipboard());
      expect(result.current.supported).toBe(true);
    });

    it('복사 성공 시 true를 반환한다', async () => {
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

      const { result } = renderHook(() => useClipboard());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.copy('테스트 텍스트');
      });

      expect(success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('테스트 텍스트');
    });

    it('복사 실패 시 false를 반환한다', async () => {
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useClipboard());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.copy('테스트 텍스트');
      });

      expect(success).toBe(false);
    });
  });
});
