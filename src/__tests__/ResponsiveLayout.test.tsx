import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('반응형 레이아웃', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem = vi.fn().mockReturnValue(null);
    window.localStorage.setItem = vi.fn();
  });

  describe('데스크톱 (768px+)', () => {
    beforeEach(() => {
      vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
        matches: query === '(min-width: 768px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
    });

    it('Editor와 Preview가 모두 보인다', () => {
      render(<App />);
      expect(screen.getByTestId('editor')).toBeVisible();
      expect(screen.getByTestId('preview')).toBeVisible();
    });

    it('MobileTabBar가 보이지 않는다', () => {
      render(<App />);
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });
  });

  describe('모바일 (768px 미만)', () => {
    beforeEach(() => {
      vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
        matches: query === '(max-width: 767px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
    });

    it('MobileTabBar가 보인다', () => {
      render(<App />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('기본적으로 Editor 탭이 활성화된다', () => {
      render(<App />);
      expect(screen.getByRole('tab', { name: /입력/i })).toHaveAttribute('aria-selected', 'true');
    });
  });
});
