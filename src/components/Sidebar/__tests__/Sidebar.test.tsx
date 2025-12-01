import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '../Sidebar';
import type { Document } from '../../../types/document';

describe('Sidebar', () => {
  const mockDocuments: Document[] = [
    {
      id: 'doc-1',
      name: '첫 번째 문서',
      content: '# 제목',
      createdAt: '2024-01-01T10:00:00.000Z',
      updatedAt: '2024-01-01T12:00:00.000Z',
    },
    {
      id: 'doc-2',
      name: '두 번째 문서',
      content: '## 내용',
      createdAt: '2024-01-02T10:00:00.000Z',
      updatedAt: '2024-01-02T10:00:00.000Z',
    },
  ];

  const defaultProps = {
    isOpen: true,
    onToggle: vi.fn(),
    documents: mockDocuments,
    onSelectDocument: vi.fn(),
    onDeleteDocument: vi.fn(),
    onSaveDocument: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('사이드바가 열린 상태로 렌더링된다', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByText('문서 목록')).toBeInTheDocument();
    });

    it('문서 목록이 표시된다', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('첫 번째 문서')).toBeInTheDocument();
      expect(screen.getByText('두 번째 문서')).toBeInTheDocument();
    });

    it('문서가 없으면 빈 상태가 표시된다', () => {
      render(<Sidebar {...defaultProps} documents={[]} />);
      expect(screen.getByText(/저장된 문서가 없습니다/)).toBeInTheDocument();
    });
  });

  describe('문서 선택', () => {
    it('문서 클릭 시 onSelectDocument가 호출된다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);

      await user.click(screen.getByTestId('document-doc-1'));
      expect(defaultProps.onSelectDocument).toHaveBeenCalledWith('doc-1');
    });

    it('현재 선택된 문서가 활성화 스타일을 가진다', () => {
      render(<Sidebar {...defaultProps} currentDocumentId="doc-1" />);
      const docItem = screen.getByTestId('document-doc-1');
      // CSS Modules로 인해 클래스 이름이 해시됨
      expect(docItem.className).toContain('active');
    });
  });

  describe('문서 삭제', () => {
    it('삭제 버튼 클릭 시 확인 UI가 표시된다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);

      await user.click(screen.getByTestId('delete-doc-1'));
      expect(screen.getByLabelText('삭제 확인')).toBeInTheDocument();
      expect(screen.getByLabelText('삭제 취소')).toBeInTheDocument();
    });

    it('삭제 확인 시 onDeleteDocument가 호출된다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);

      await user.click(screen.getByTestId('delete-doc-1'));
      await user.click(screen.getByLabelText('삭제 확인'));

      expect(defaultProps.onDeleteDocument).toHaveBeenCalledWith('doc-1');
    });

    it('삭제 취소 시 확인 UI가 사라진다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);

      await user.click(screen.getByTestId('delete-doc-1'));
      await user.click(screen.getByLabelText('삭제 취소'));

      expect(screen.queryByLabelText('삭제 확인')).not.toBeInTheDocument();
    });
  });

  describe('문서 저장', () => {
    it('저장 버튼 클릭 시 onSaveDocument가 호출된다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);

      await user.click(screen.getByTestId('save-document-button'));
      expect(defaultProps.onSaveDocument).toHaveBeenCalled();
    });
  });

  describe('토글', () => {
    it('닫기 버튼 클릭 시 onToggle이 호출된다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);

      await user.click(screen.getByTestId('sidebar-close-button'));
      expect(defaultProps.onToggle).toHaveBeenCalled();
    });

    it('사이드바가 닫힌 상태면 열기 버튼이 표시된다', () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);
      expect(screen.getByTestId('sidebar-open-button')).toBeInTheDocument();
    });

    it('열기 버튼 클릭 시 onToggle이 호출된다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} isOpen={false} />);

      await user.click(screen.getByTestId('sidebar-open-button'));
      expect(defaultProps.onToggle).toHaveBeenCalled();
    });
  });

  describe('모바일', () => {
    it('모바일에서 열린 상태면 오버레이가 표시된다', () => {
      render(<Sidebar {...defaultProps} isMobile={true} />);
      expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument();
    });

    it('오버레이 클릭 시 onToggle이 호출된다', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} isMobile={true} />);

      await user.click(screen.getByTestId('sidebar-overlay'));
      expect(defaultProps.onToggle).toHaveBeenCalled();
    });
  });
});
