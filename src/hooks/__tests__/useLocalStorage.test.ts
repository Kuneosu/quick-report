import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (window.localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementation(() => {});
  });

  describe('초기값 로드', () => {
    it('localStorage에 값이 없으면 초기값을 반환한다', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'default'));
      expect(result.current[0]).toBe('default');
    });

    it('localStorage에 값이 있으면 저장된 값을 반환한다', () => {
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('"stored"');

      const { result } = renderHook(() => useLocalStorage('key', 'default'));
      expect(result.current[0]).toBe('stored');
    });

    it('JSON 파싱 실패 시 초기값을 반환한다', () => {
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('invalid json');

      const { result } = renderHook(() => useLocalStorage('key', 'default'));
      expect(result.current[0]).toBe('default');
    });
  });

  describe('값 저장', () => {
    it('setValue 호출 시 localStorage에 저장된다', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'initial'));

      act(() => {
        result.current[1]('new value');
      });

      expect(window.localStorage.setItem).toHaveBeenCalledWith('key', '"new value"');
    });

    it('함수형 업데이트가 지원된다', () => {
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('"current"');

      const { result } = renderHook(() => useLocalStorage('key', 'initial'));

      act(() => {
        result.current[1]((prev) => prev + ' updated');
      });

      expect(result.current[0]).toBe('current updated');
    });
  });

  describe('에러 핸들링', () => {
    it('저장 실패 시 에러를 발생시키지 않는다', () => {
      (window.localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });

      const { result } = renderHook(() => useLocalStorage('key', 'initial'));

      expect(() => {
        act(() => {
          result.current[1]('new value');
        });
      }).not.toThrow();
    });
  });
});
