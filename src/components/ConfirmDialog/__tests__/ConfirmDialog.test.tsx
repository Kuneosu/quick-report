import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: '확인',
    message: '정말 삭제하시겠습니까?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  describe('렌더링', () => {
    it('열린 상태에서 다이얼로그가 표시된다', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('닫힌 상태에서 다이얼로그가 표시되지 않는다', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('제목이 표시된다', () => {
      render(<ConfirmDialog {...defaultProps} title="새로 작성" />);
      expect(screen.getByText('새로 작성')).toBeInTheDocument();
    });

    it('메시지가 표시된다', () => {
      render(<ConfirmDialog {...defaultProps} message="내용을 초기화하시겠습니까?" />);
      expect(screen.getByText('내용을 초기화하시겠습니까?')).toBeInTheDocument();
    });

    it('확인 버튼이 표시된다', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /확인/i })).toBeInTheDocument();
    });

    it('취소 버튼이 표시된다', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /취소/i })).toBeInTheDocument();
    });
  });

  describe('버튼 동작', () => {
    it('확인 버튼 클릭 시 onConfirm 호출', async () => {
      const user = userEvent.setup();
      const handleConfirm = vi.fn();
      render(<ConfirmDialog {...defaultProps} onConfirm={handleConfirm} />);

      await user.click(screen.getByRole('button', { name: /확인/i }));
      expect(handleConfirm).toHaveBeenCalled();
    });

    it('취소 버튼 클릭 시 onCancel 호출', async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();
      render(<ConfirmDialog {...defaultProps} onCancel={handleCancel} />);

      await user.click(screen.getByRole('button', { name: /취소/i }));
      expect(handleCancel).toHaveBeenCalled();
    });

    it('배경 클릭 시 onCancel 호출', async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();
      render(<ConfirmDialog {...defaultProps} onCancel={handleCancel} />);

      await user.click(screen.getByTestId('dialog-backdrop'));
      expect(handleCancel).toHaveBeenCalled();
    });
  });

  describe('접근성', () => {
    it('role="alertdialog"가 설정되어 있다', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('aria-modal이 설정되어 있다', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toHaveAttribute('aria-modal', 'true');
    });
  });
});
