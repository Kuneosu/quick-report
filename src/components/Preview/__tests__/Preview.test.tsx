import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Preview } from '../Preview';

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
});
