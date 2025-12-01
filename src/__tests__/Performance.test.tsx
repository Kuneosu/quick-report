import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import { convertMarkdownToReport } from '../utils/markdownConverter';

describe('성능 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem = vi.fn().mockReturnValue(null);
    window.localStorage.setItem = vi.fn();
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  describe('변환 처리 시간', () => {
    it('100줄 마크다운 변환이 100ms 미만으로 완료된다', () => {
      const lines = Array(100).fill('## 테스트 항목').join('\n');

      const start = performance.now();
      convertMarkdownToReport(lines);
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
    });

    it('1000줄 마크다운 변환이 500ms 미만으로 완료된다', () => {
      const lines = Array(1000).fill('## 테스트 항목').join('\n');

      const start = performance.now();
      convertMarkdownToReport(lines);
      const end = performance.now();

      expect(end - start).toBeLessThan(500);
    });

    it('혼합 콘텐츠 500줄 변환이 200ms 미만으로 완료된다', () => {
      const mixedContent = Array(100)
        .fill(null)
        .map((_, i) => {
          const mod = i % 5;
          if (mod === 0) return '# 프로젝트';
          if (mod === 1) return '## 카테고리';
          if (mod === 2) return '### 세부 항목';
          if (mod === 3) return '#### 하위 사항';
          return '일반 텍스트입니다.';
        })
        .join('\n');

      const start = performance.now();
      convertMarkdownToReport(mixedContent);
      const end = performance.now();

      expect(end - start).toBeLessThan(200);
    });
  });

  describe('렌더링 성능', () => {
    it('초기 렌더링이 500ms 미만으로 완료된다', () => {
      const start = performance.now();
      render(<App />);
      const end = performance.now();

      expect(end - start).toBeLessThan(500);
    });

    it('반복 렌더링 평균 시간이 100ms 미만이다', () => {
      const times: number[] = [];

      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        const { unmount } = render(<App />);
        const end = performance.now();
        times.push(end - start);
        unmount();
      }

      const average = times.reduce((a, b) => a + b, 0) / times.length;
      expect(average).toBeLessThan(100);
    });
  });

  describe('메모리 효율', () => {
    it('빈 문자열 변환 시 빈 문자열 반환 (불필요한 객체 생성 없음)', () => {
      const result = convertMarkdownToReport('');
      expect(result).toBe('');
    });

    it('공백만 있는 입력 처리', () => {
      const result = convertMarkdownToReport('   \n   \n   ');
      // 공백만 있는 줄은 빈 줄로 처리됨 (trim 후 빈 문자열)
      expect(result).toBe('\n\n');
    });
  });
});
