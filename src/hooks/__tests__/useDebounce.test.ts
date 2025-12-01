import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기값을 즉시 반환한다', () => {
    const { result } = renderHook(() => useDebounce('initial', 200));
    expect(result.current).toBe('initial');
  });

  it('지연 시간 전에는 값이 변경되지 않는다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('initial');
  });

  it('지연 시간 후에 값이 변경된다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('updated');
  });

  it('연속 변경 시 마지막 값만 반영된다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 'v1' } }
    );

    rerender({ value: 'v2' });
    act(() => vi.advanceTimersByTime(100));

    rerender({ value: 'v3' });
    act(() => vi.advanceTimersByTime(100));

    rerender({ value: 'v4' });
    act(() => vi.advanceTimersByTime(200));

    expect(result.current).toBe('v4');
  });
});
