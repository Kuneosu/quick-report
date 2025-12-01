import { useState, useCallback } from 'react';

type SetValue<T> = T | ((prev: T) => T);

/**
 * localStorage와 동기화되는 상태를 제공하는 훅
 * SSR 안전하며, JSON 직렬화/역직렬화를 자동 처리
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  // 초기값 로드 (lazy initialization)
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }

      return JSON.parse(item) as T;
    } catch {
      return initialValue;
    }
  });

  // 값 설정 함수
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // 함수형 업데이트 지원
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        // localStorage 저장 실패 시 무시 (예: quota 초과)
        console.warn(`Failed to save to localStorage: ${key}`);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
