import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Footer } from '../Footer';

describe('Footer', () => {
  const defaultProps = {
    savedAt: null,
    onClear: vi.fn(),
  };

  describe('렌더링', () => {
    it('새로 작성 버튼이 표시된다', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByRole('button', { name: /새로 작성/i })).toBeInTheDocument();
    });

    it('저장 시간이 없을 때 저장 상태가 표시되지 않는다', () => {
      render(<Footer {...defaultProps} savedAt={null} />);
      expect(screen.queryByText(/저장됨/i)).not.toBeInTheDocument();
    });

    it('저장 시간이 있을 때 저장 상태가 표시된다', () => {
      const savedAt = new Date('2024-11-27T12:30:00');
      render(<Footer {...defaultProps} savedAt={savedAt} />);
      expect(screen.getByText(/자동 저장됨/i)).toBeInTheDocument();
    });
  });

  describe('새로 작성 버튼', () => {
    it('클릭 시 onClear 호출', async () => {
      const user = userEvent.setup();
      const handleClear = vi.fn();
      render(<Footer {...defaultProps} onClear={handleClear} />);

      await user.click(screen.getByRole('button', { name: /새로 작성/i }));
      expect(handleClear).toHaveBeenCalled();
    });
  });

  describe('접근성', () => {
    it('footer 역할이 있다', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('저장 상태에 aria-live가 설정되어 있다', () => {
      const savedAt = new Date();
      render(<Footer {...defaultProps} savedAt={savedAt} />);
      expect(screen.getByText(/자동 저장됨/i).closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
    });
  });
});
