import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuideModal } from '../GuideModal';

describe('GuideModal', () => {
  describe('렌더링', () => {
    it('열린 상태에서 모달이 표시된다', () => {
      render(<GuideModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('닫힌 상태에서 모달이 표시되지 않는다', () => {
      render(<GuideModal isOpen={false} onClose={() => {}} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('제목이 표시된다', () => {
      render(<GuideModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByText(/마크다운 문법 가이드/i)).toBeInTheDocument();
    });

    it('문법 설명이 표시된다', () => {
      render(<GuideModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByText(/# 제목/)).toBeInTheDocument();
      expect(screen.getByText(/## 항목/)).toBeInTheDocument();
      expect(screen.getByText(/### 세부/)).toBeInTheDocument();
      expect(screen.getByText(/#### 하위/)).toBeInTheDocument();
    });
  });

  describe('닫기 동작', () => {
    it('닫기 버튼 클릭 시 onClose 호출', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(<GuideModal isOpen={true} onClose={handleClose} />);

      await user.click(screen.getByRole('button', { name: /닫기/i }));
      expect(handleClose).toHaveBeenCalled();
    });

    it('배경 클릭 시 onClose 호출', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(<GuideModal isOpen={true} onClose={handleClose} />);

      await user.click(screen.getByTestId('modal-backdrop'));
      expect(handleClose).toHaveBeenCalled();
    });

    it('확인 버튼 클릭 시 onClose 호출', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(<GuideModal isOpen={true} onClose={handleClose} />);

      await user.click(screen.getByRole('button', { name: /확인/i }));
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('접근성', () => {
    it('role="dialog"가 설정되어 있다', () => {
      render(<GuideModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('aria-modal이 설정되어 있다', () => {
      render(<GuideModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });
  });
});
