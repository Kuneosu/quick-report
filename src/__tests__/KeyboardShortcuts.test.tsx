import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('키보드 단축키', () => {
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

  describe('모달 ESC 키', () => {
    it('가이드 모달에서 ESC 키 누르면 닫힌다', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 가이드 모달 열기
      await user.click(screen.getByRole('button', { name: /가이드/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // ESC 키로 닫기
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('확인 다이얼로그에서 ESC 키 누르면 닫힌다', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 에디터에 내용 입력
      const editor = screen.getByTestId('editor');
      await user.type(editor, '# 테스트');

      // 새로 작성 버튼 클릭
      await user.click(screen.getByRole('button', { name: /새로 작성/i }));
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      // ESC 키로 닫기
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('버튼 키보드 활성화', () => {
    it('Enter 키로 버튼 클릭 가능', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 가이드 버튼에 포커스
      const guideButton = screen.getByRole('button', { name: /가이드/i });
      guideButton.focus();

      // Enter 키로 클릭
      await user.keyboard('{Enter}');

      // 모달이 열림
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('Space 키로 버튼 클릭 가능', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 가이드 버튼에 포커스
      const guideButton = screen.getByRole('button', { name: /가이드/i });
      guideButton.focus();

      // Space 키로 클릭
      await user.keyboard(' ');

      // 모달이 열림
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('테마 전환', () => {
    it('테마 버튼 키보드로 토글 가능', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 테마 버튼에 포커스
      const themeButton = screen.getByRole('button', { name: /모드/i });
      themeButton.focus();

      // Enter 키로 토글
      await user.keyboard('{Enter}');

      // 다크 모드로 변경됨
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
