import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    document.documentElement.removeAttribute('data-theme');
  });

  describe('초기 테마', () => {
    it('localStorage에 값이 없으면 light가 기본값이다', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('light');
    });

    it('localStorage에 저장된 테마를 불러온다', () => {
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('"dark"');

      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('dark');
    });
  });

  describe('테마 전환', () => {
    it('toggleTheme 호출 시 테마가 전환된다', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
    });

    it('다크 모드에서 toggleTheme 호출 시 라이트로 전환', () => {
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('"dark"');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
    });

    it('isDark가 테마 상태를 반영한다', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(true);
    });
  });

  describe('DOM 업데이트', () => {
    it('테마 변경 시 data-theme 속성이 업데이트된다', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
