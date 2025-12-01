import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyButton } from '../CopyButton';

describe('CopyButton', () => {
  describe('렌더링', () => {
    it('버튼이 렌더링된다', () => {
      render(<CopyButton text="복사할 텍스트" onCopySuccess={() => {}} />);
      expect(screen.getByRole('button', { name: /복사/i })).toBeInTheDocument();
    });

    it('disabled 상태에서 비활성화된다', () => {
      render(<CopyButton text="" onCopySuccess={() => {}} disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('복사 기능', () => {
    it('복사 성공 시 onCopySuccess 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const handleSuccess = vi.fn();
      render(<CopyButton text="텍스트" onCopySuccess={handleSuccess} />);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it('복사 성공 시 버튼 상태가 변경된다', async () => {
      const user = userEvent.setup();
      render(<CopyButton text="텍스트" onCopySuccess={() => {}} />);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveTextContent(/완료|✓/i);
      });
    });
  });

  describe('접근성', () => {
    it('aria-label이 설정되어 있다', () => {
      render(<CopyButton text="텍스트" onCopySuccess={() => {}} />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label');
    });
  });
});
