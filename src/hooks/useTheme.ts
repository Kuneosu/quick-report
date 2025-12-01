import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'light' | 'dark';

const THEME_KEY = 'md-to-report-theme';

interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

/**
 * 다크/라이트 테마를 관리하는 훅
 * localStorage에 설정을 저장하고, document에 data-theme 속성을 설정
 */
export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useLocalStorage<Theme>(THEME_KEY, 'light');

  // DOM에 테마 속성 적용
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 테마 토글
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  };
}
