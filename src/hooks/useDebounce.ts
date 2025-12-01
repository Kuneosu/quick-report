import { useState, useEffect } from 'react';

/**
 * 값의 변경을 지정된 시간만큼 지연시키는 훅
 * 타이핑 중 과도한 렌더링을 방지하는 데 유용
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
