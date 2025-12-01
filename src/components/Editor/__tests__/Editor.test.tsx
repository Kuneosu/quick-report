import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '../Editor';

describe('Editor', () => {
  describe('렌더링', () => {
    it('textarea가 렌더링된다', () => {
      render(<Editor value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('placeholder 텍스트가 표시된다', () => {
      render(<Editor value="" onChange={() => {}} />);
      expect(screen.getByPlaceholderText(/프로젝트명을 입력/i)).toBeInTheDocument();
    });

    it('전달된 value가 표시된다', () => {
      render(<Editor value="# 테스트" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('# 테스트');
    });
  });

  describe('인터랙션', () => {
    it('텍스트 입력 시 onChange가 호출된다', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Editor value="" onChange={handleChange} />);

      await user.type(screen.getByRole('textbox'), '# 제목');
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('접근성', () => {
    it('aria-label이 설정되어 있다', () => {
      render(<Editor value="" onChange={() => {}} />);
      expect(screen.getByLabelText(/마크다운 입력/i)).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('data-testid가 설정되어 있다', () => {
      render(<Editor value="" onChange={() => {}} />);
      expect(screen.getByTestId('editor')).toBeInTheDocument();
    });
  });
});
