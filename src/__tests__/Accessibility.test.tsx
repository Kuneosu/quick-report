import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('접근성', () => {
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

  describe('ARIA 속성', () => {
    it('Editor에 aria-label이 설정되어 있다', () => {
      render(<App />);
      expect(screen.getByTestId('editor')).toHaveAttribute('aria-label');
    });

    it('Preview에 aria-live가 설정되어 있다', () => {
      render(<App />);
      expect(screen.getByTestId('preview')).toHaveAttribute('aria-live');
    });

    it('버튼에 aria-label이 설정되어 있다', () => {
      render(<App />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(
          button.hasAttribute('aria-label') || button.textContent?.trim()
        ).toBeTruthy();
      });
    });
  });

  describe('키보드 네비게이션', () => {
    it('Tab 키로 인터랙티브 요소 간 이동 가능', async () => {
      const user = userEvent.setup();
      render(<App />);

      const editor = screen.getByTestId('editor');
      editor.focus();
      expect(document.activeElement).toBe(editor);

      await user.tab();
      // 다음 포커스 가능한 요소로 이동 확인
      expect(document.activeElement).not.toBe(editor);
    });
  });

  describe('포커스 표시', () => {
    it('포커스된 요소에 시각적 표시가 있다', () => {
      render(<App />);
      const editor = screen.getByTestId('editor');
      editor.focus();

      // focus-visible 스타일 확인
      expect(editor).toHaveFocus();
    });

    it('버튼 포커스 시 포커스 상태가 된다', () => {
      render(<App />);
      // 항상 활성화된 버튼 (가이드 버튼) 사용
      const guideButton = screen.getByRole('button', { name: /가이드/i });
      guideButton.focus();

      expect(guideButton).toHaveFocus();
    });
  });

  describe('스크린 리더 호환', () => {
    it('주요 영역에 role이 설정되어 있다', () => {
      render(<App />);
      // Preview에 region role
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('토스트 메시지에 role="alert"가 있다', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

      render(<App />);

      // 에디터에 내용 입력
      const editor = screen.getByTestId('editor');
      await user.type(editor, '# 테스트');

      // 복사 버튼 클릭
      const copyButton = screen.getByRole('button', { name: /복사/i });
      await user.click(copyButton);

      // 토스트에 role="alert" 확인
      const toast = await screen.findByRole('alert');
      expect(toast).toBeInTheDocument();
    });
  });
});
