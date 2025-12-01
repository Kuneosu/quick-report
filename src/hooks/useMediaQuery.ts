import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent | { matches: boolean }) => {
      setMatches(event.matches);
    };

    // 초기값 설정
    setMatches(mediaQueryList.matches);

    // 이벤트 리스너 등록
    mediaQueryList.addEventListener('change', handleChange);

    // 클린업
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}
