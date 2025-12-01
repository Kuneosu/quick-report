import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '../Editor';

// State를 관리하는 wrapper 컴포넌트
function EditorWrapper({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  return (
    <>
      <Editor value={value} onChange={setValue} />
      <div data-testid="output">{value}</div>
    </>
  );
}

describe('Editor 슬래시 단축키', () => {
  describe('/1 ~ /4 변환', () => {
    it('/1 + Space 입력 시 # 으로 변환된다', async () => {
      const user = userEvent.setup();
      render(<EditorWrapper />);

      const editor = screen.getByTestId('editor');
      await user.type(editor, '/1 ');

      expect(screen.getByTestId('output').textContent).toBe('# ');
    });

    it('/2 + Space 입력 시 ## 으로 변환된다', async () => {
      const user = userEvent.setup();
      render(<EditorWrapper />);

      const editor = screen.getByTestId('editor');
      await user.type(editor, '/2 ');

      expect(screen.getByTestId('output').textContent).toBe('## ');
    });

    it('/3 + Space 입력 시 ### 으로 변환된다', async () => {
      const user = userEvent.setup();
      render(<EditorWrapper />);

      const editor = screen.getByTestId('editor');
      await user.type(editor, '/3 ');

      expect(screen.getByTestId('output').textContent).toBe('### ');
    });

    it('/4 + Space 입력 시 #### 으로 변환된다', async () => {
      const user = userEvent.setup();
      render(<EditorWrapper />);

      const editor = screen.getByTestId('editor');
      await user.type(editor, '/4 ');

      expect(screen.getByTestId('output').textContent).toBe('#### ');
    });
  });

  describe('기존 텍스트와 함께 사용', () => {
    it('기존 텍스트 뒤에 /1 입력 시 변환된다', async () => {
      const user = userEvent.setup();
      render(<EditorWrapper initialValue="Hello\n" />);

      const editor = screen.getByTestId('editor');
      await user.type(editor, '/1 ');

      expect(screen.getByTestId('output').textContent).toContain('# ');
    });
  });

  describe('변환되지 않는 경우', () => {
    it('/5는 변환되지 않는다', async () => {
      const user = userEvent.setup();
      render(<EditorWrapper />);

      const editor = screen.getByTestId('editor');
      await user.type(editor, '/5 ');

      expect(screen.getByTestId('output').textContent).toBe('/5 ');
    });

    it('/1 뒤에 Space 없이 다른 문자가 오면 변환되지 않는다', async () => {
      const user = userEvent.setup();
      render(<EditorWrapper />);

      const editor = screen.getByTestId('editor');
      await user.type(editor, '/1a');

      expect(screen.getByTestId('output').textContent).toBe('/1a');
    });
  });
});
