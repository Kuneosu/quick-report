import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';

describe('Header', () => {
  const defaultProps = {
    isDark: false,
    onToggleTheme: vi.fn(),
    onOpenGuide: vi.fn(),
    onOpenSettings: vi.fn(),
    onOpenImport: vi.fn(),
  };

  describe('렌더링', () => {
    it('로고가 표시된다', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('QuickReport')).toBeInTheDocument();
    });

    it('가이드 버튼이 표시된다', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByRole('button', { name: /가이드/i })).toBeInTheDocument();
    });

    it('테마 토글 버튼이 표시된다', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByRole('button', { name: /모드/i })).toBeInTheDocument();
    });
  });

  describe('테마 토글', () => {
    it('라이트 모드일 때 달 아이콘이 표시된다', () => {
      render(<Header {...defaultProps} isDark={false} />);
      expect(screen.getByText('🌙')).toBeInTheDocument();
    });

    it('다크 모드일 때 해 아이콘이 표시된다', () => {
      render(<Header {...defaultProps} isDark={true} />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });

    it('테마 버튼 클릭 시 onToggleTheme 호출', async () => {
      const user = userEvent.setup();
      const handleToggle = vi.fn();
      render(<Header {...defaultProps} onToggleTheme={handleToggle} />);

      await user.click(screen.getByRole('button', { name: /모드/i }));
      expect(handleToggle).toHaveBeenCalled();
    });
  });

  describe('가이드 버튼', () => {
    it('가이드 버튼 클릭 시 onOpenGuide 호출', async () => {
      const user = userEvent.setup();
      const handleOpenGuide = vi.fn();
      render(<Header {...defaultProps} onOpenGuide={handleOpenGuide} />);

      await user.click(screen.getByRole('button', { name: /가이드/i }));
      expect(handleOpenGuide).toHaveBeenCalled();
    });
  });

  describe('설정 버튼', () => {
    it('설정 버튼이 표시된다', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('settings-button')).toBeInTheDocument();
    });

    it('설정 버튼 클릭 시 onOpenSettings 호출', async () => {
      const user = userEvent.setup();
      const handleOpenSettings = vi.fn();
      render(<Header {...defaultProps} onOpenSettings={handleOpenSettings} />);

      await user.click(screen.getByTestId('settings-button'));
      expect(handleOpenSettings).toHaveBeenCalled();
    });
  });

  describe('불러오기 버튼', () => {
    it('불러오기 버튼이 표시된다', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByTestId('import-button')).toBeInTheDocument();
    });

    it('불러오기 버튼 클릭 시 onOpenImport 호출', async () => {
      const user = userEvent.setup();
      const handleOpenImport = vi.fn();
      render(<Header {...defaultProps} onOpenImport={handleOpenImport} />);

      await user.click(screen.getByTestId('import-button'));
      expect(handleOpenImport).toHaveBeenCalled();
    });
  });

  describe('접근성', () => {
    it('테마 버튼에 aria-pressed가 설정되어 있다', () => {
      render(<Header {...defaultProps} isDark={true} />);
      expect(screen.getByRole('button', { name: /모드/i })).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
