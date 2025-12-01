import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportModal } from '../ImportModal';

describe('ImportModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onApply: vi.fn(),
    hasExistingContent: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('렌더링', () => {
    it('isOpen이 true일 때 모달이 표시된다', () => {
      render(<ImportModal {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('isOpen이 false일 때 모달이 표시되지 않는다', () => {
      render(<ImportModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('제목이 올바르게 표시된다', () => {
      render(<ImportModal {...defaultProps} />);
      expect(screen.getByText('데이터 불러오기')).toBeInTheDocument();
    });

    it('설명이 올바르게 표시된다', () => {
      render(<ImportModal {...defaultProps} />);
      expect(screen.getByText(/기존 보고서 형식의 데이터를 마크다운으로 변환/)).toBeInTheDocument();
    });

    it('텍스트 입력 영역이 표시된다', () => {
      render(<ImportModal {...defaultProps} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('라인/문자 카운트가 표시된다', () => {
      render(<ImportModal {...defaultProps} />);
      expect(screen.getByText(/라인:/)).toBeInTheDocument();
      expect(screen.getByText(/문자:/)).toBeInTheDocument();
    });
  });

  describe('모달 열기/닫기', () => {
    it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(<ImportModal {...defaultProps} onClose={handleClose} />);

      await user.click(screen.getByLabelText('닫기'));
      expect(handleClose).toHaveBeenCalled();
    });

    it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(<ImportModal {...defaultProps} onClose={handleClose} />);

      await user.click(screen.getByText('취소'));
      expect(handleClose).toHaveBeenCalled();
    });

    it('배경 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(<ImportModal {...defaultProps} onClose={handleClose} />);

      await user.click(screen.getByTestId('import-modal-backdrop'));
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('텍스트 입력', () => {
    it('텍스트 입력이 가능하다', async () => {
      const user = userEvent.setup();
      render(<ImportModal {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '# 테스트');
      expect(textarea).toHaveValue('# 테스트');
    });

    it('입력 시 라인/문자 카운트가 업데이트된다', async () => {
      const user = userEvent.setup();
      render(<ImportModal {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'line1\nline2');

      await waitFor(() => {
        expect(screen.getByText(/라인: 2/)).toBeInTheDocument();
      });
    });

    it('빈 입력 시 변환 버튼이 비활성화된다', () => {
      render(<ImportModal {...defaultProps} />);

      const convertButton = screen.getByText('변환 미리보기');
      expect(convertButton).toBeDisabled();
    });

    it('입력이 있으면 변환 버튼이 활성화된다', async () => {
      const user = userEvent.setup();
      render(<ImportModal {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '# 테스트');

      const convertButton = screen.getByText('변환 미리보기');
      expect(convertButton).not.toBeDisabled();
    });
  });

  describe('변환 및 미리보기', () => {
    it('변환 버튼 클릭 시 미리보기 화면으로 전환된다', async () => {
      const user = userEvent.setup();
      render(<ImportModal {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '# 프로젝트\n## 활동\n### 작업');

      await user.click(screen.getByText('변환 미리보기'));

      await waitFor(() => {
        expect(screen.getByText('미리보기')).toBeInTheDocument();
      });
    });

    it('미리보기 화면에서 통계가 표시된다', async () => {
      const user = userEvent.setup();
      render(<ImportModal {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '# 프로젝트\n## 활동\n### 작업');

      await user.click(screen.getByText('변환 미리보기'));

      await waitFor(() => {
        expect(screen.getByText('프로젝트')).toBeInTheDocument();
        expect(screen.getByText('그룹핑')).toBeInTheDocument();
        expect(screen.getByText('중복제거')).toBeInTheDocument();
      });
    });

    it('뒤로 버튼 클릭 시 입력 화면으로 돌아간다', async () => {
      const user = userEvent.setup();
      render(<ImportModal {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '# 프로젝트\n## 활동\n### 작업');

      await user.click(screen.getByText('변환 미리보기'));

      await waitFor(() => {
        expect(screen.getByText('뒤로')).toBeInTheDocument();
      });

      await user.click(screen.getByText('뒤로'));

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });
  });

  describe('에디터 적용', () => {
    it('에디터가 비어있을 때 "에디터에 적용" 버튼이 표시된다', async () => {
      const user = userEvent.setup();
      render(<ImportModal {...defaultProps} hasExistingContent={false} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '# 프로젝트\n## 활동\n### 작업');

      await user.click(screen.getByText('변환 미리보기'));

      await waitFor(() => {
        expect(screen.getByText('에디터에 적용')).toBeInTheDocument();
      });
    });

    it('에디터에 내용이 있을 때 덮어쓰기/뒤에 추가 버튼이 표시된다', async () => {
      const user = userEvent.setup();
      render(<ImportModal {...defaultProps} hasExistingContent={true} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '# 프로젝트\n## 활동\n### 작업');

      await user.click(screen.getByText('변환 미리보기'));

      await waitFor(() => {
        expect(screen.getByText('덮어쓰기')).toBeInTheDocument();
        expect(screen.getByText('뒤에 추가')).toBeInTheDocument();
      });
    });

    it('덮어쓰기 클릭 시 onApply가 overwrite 모드로 호출된다', async () => {
      const user = userEvent.setup();
      const handleApply = vi.fn();
      render(<ImportModal {...defaultProps} hasExistingContent={true} onApply={handleApply} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '# 프로젝트\n## 활동\n### 작업');

      await user.click(screen.getByText('변환 미리보기'));

      await waitFor(() => {
        expect(screen.getByText('덮어쓰기')).toBeInTheDocument();
      });

      await user.click(screen.getByText('덮어쓰기'));

      expect(handleApply).toHaveBeenCalledWith(expect.any(String), 'overwrite');
    });

    it('뒤에 추가 클릭 시 onApply가 append 모드로 호출된다', async () => {
      const user = userEvent.setup();
      const handleApply = vi.fn();
      render(<ImportModal {...defaultProps} hasExistingContent={true} onApply={handleApply} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '# 프로젝트\n## 활동\n### 작업');

      await user.click(screen.getByText('변환 미리보기'));

      await waitFor(() => {
        expect(screen.getByText('뒤에 추가')).toBeInTheDocument();
      });

      await user.click(screen.getByText('뒤에 추가'));

      expect(handleApply).toHaveBeenCalledWith(expect.any(String), 'append');
    });
  });

  describe('키보드 단축키', () => {
    it('ESC 키를 누르면 모달이 닫힌다', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(<ImportModal {...defaultProps} onClose={handleClose} />);

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalled();
    });

    it('Ctrl+Enter로 변환을 실행할 수 있다', async () => {
      const user = userEvent.setup();
      render(<ImportModal {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '# 프로젝트\n## 활동\n### 작업');

      await user.keyboard('{Control>}{Enter}{/Control}');

      await waitFor(() => {
        expect(screen.getByText('미리보기')).toBeInTheDocument();
      });
    });
  });

  describe('접근성', () => {
    it('모달에 적절한 aria 속성이 설정되어 있다', () => {
      render(<ImportModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'import-modal-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'import-modal-description');
    });

    it('입력 영역에 aria-describedby가 설정되어 있다', () => {
      render(<ImportModal {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'input-hint');
    });
  });
});
