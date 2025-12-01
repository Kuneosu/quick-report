import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App 통합 테스트', () => {
  describe('기본 변환 플로우', () => {
    it('마크다운 입력 시 변환 결과가 표시된다', async () => {
      const user = userEvent.setup();
      render(<App />);

      const editor = screen.getByTestId('editor');
      await user.clear(editor);
      await user.type(editor, '# 테스트 제목');

      await waitFor(() => {
        expect(screen.getByTestId('preview')).toHaveTextContent('▶ 테스트 제목');
      });
    });

    it('H1~H4가 올바르게 변환되어 표시된다', async () => {
      const user = userEvent.setup();
      render(<App />);

      const editor = screen.getByTestId('editor');
      await user.clear(editor);
      await user.type(editor, '# 제목\n## 카테고리\n### 항목\n#### 하위');

      await waitFor(() => {
        const preview = screen.getByTestId('preview');
        expect(preview).toHaveTextContent('▶ 제목');
        expect(preview).toHaveTextContent('- 카테고리');
        expect(preview).toHaveTextContent('+ 항목');
        expect(preview).toHaveTextContent('. 하위');
      });
    });
  });

  describe('레이아웃', () => {
    it('Editor와 Preview가 모두 렌더링된다', () => {
      render(<App />);
      expect(screen.getByTestId('editor')).toBeInTheDocument();
      expect(screen.getByTestId('preview')).toBeInTheDocument();
    });
  });
});
