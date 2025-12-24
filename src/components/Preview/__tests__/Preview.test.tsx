import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Preview } from '../Preview';
import * as useClipboardHook from '../../../hooks/useClipboard';

describe('Preview', () => {
  describe('렌더링', () => {
    it('변환된 텍스트가 표시된다', () => {
      render(<Preview content="▶ 주간 보고" />);
      expect(screen.getByText('▶ 주간 보고')).toBeInTheDocument();
    });

    it('빈 내용일 때 안내 메시지가 표시된다', () => {
      render(<Preview content="" />);
      expect(screen.getByText(/마크다운을 입력/i)).toBeInTheDocument();
    });

    it('여러 줄 내용이 올바르게 표시된다', () => {
      const content = '▶ 제목\n  - 항목';
      render(<Preview content={content} />);
      expect(screen.getByText(/▶ 제목/)).toBeInTheDocument();
      expect(screen.getByText(/- 항목/)).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('aria-live="polite"가 설정되어 있다', () => {
      render(<Preview content="테스트" />);
      expect(screen.getByRole('region')).toHaveAttribute('aria-live', 'polite');
    });

    it('aria-label이 설정되어 있다', () => {
      render(<Preview content="테스트" />);
      expect(screen.getByLabelText(/변환 결과/i)).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('data-testid가 설정되어 있다', () => {
      render(<Preview content="테스트" />);
      expect(screen.getByTestId('preview')).toBeInTheDocument();
    });
  });

  describe('인터랙션', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('섹션을 클릭하면 클립보드에 복사된다', async () => {
      const copyMock = vi.fn().mockResolvedValue(true);
      vi.spyOn(useClipboardHook, 'useClipboard').mockReturnValue({
        copy: copyMock,
        supported: true,
      });

      const user = (await import('@testing-library/user-event')).default.setup();
      const content = '▶ 섹션 1\n내용 1\n▶ 섹션 2\n내용 2';
      const onCopySuccess = vi.fn();
      
      render(<Preview content={content} onCopySuccess={onCopySuccess} />);
      
      const sections = screen.getAllByRole('button');
      
      // 첫 번째 섹션 클릭
      await user.click(sections[0]);
      expect(copyMock).toHaveBeenCalledWith('▶ 섹션 1\n내용 1');
      expect(onCopySuccess).toHaveBeenCalled();
      
      // 두 번째 섹션 클릭
      await user.click(sections[1]);
      expect(copyMock).toHaveBeenCalledWith('▶ 섹션 2\n내용 2');
    });
  });
});