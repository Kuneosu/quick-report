import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDocuments } from '../useDocuments';

describe('useDocuments', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('초기화', () => {
    it('빈 문서 목록으로 시작한다', () => {
      const { result } = renderHook(() => useDocuments());
      expect(result.current.documents).toEqual([]);
    });

  });

  describe('문서 저장', () => {
    it('새 문서를 저장할 수 있다', () => {
      const { result } = renderHook(() => useDocuments());

      act(() => {
        result.current.saveDocument({ content: '# 새 문서' });
      });

      expect(result.current.documents).toHaveLength(1);
      expect(result.current.documents[0].content).toBe('# 새 문서');
    });

    it('문서 이름을 지정할 수 있다', () => {
      const { result } = renderHook(() => useDocuments());

      act(() => {
        result.current.saveDocument({ name: '나의 문서', content: '내용' });
      });

      expect(result.current.documents[0].name).toBe('나의 문서');
    });

    it('이름 미지정 시 날짜 기반 이름이 생성된다', () => {
      const { result } = renderHook(() => useDocuments());

      act(() => {
        result.current.saveDocument({ content: '내용' });
      });

      expect(result.current.documents[0].name).toMatch(/문서/);
    });

    it('저장된 문서에 id와 타임스탬프가 설정된다', () => {
      const { result } = renderHook(() => useDocuments());

      act(() => {
        result.current.saveDocument({ content: '내용' });
      });

      expect(result.current.documents[0].id).toBeTruthy();
      expect(result.current.documents[0].createdAt).toBeTruthy();
      expect(result.current.documents[0].updatedAt).toBeTruthy();
    });
  });

  describe('문서 불러오기', () => {
    it('id로 문서를 불러올 수 있다', () => {
      const { result } = renderHook(() => useDocuments());

      let doc1Id: string;
      act(() => {
        const doc1 = result.current.saveDocument({ name: '문서1', content: '내용1' });
        doc1Id = doc1.id;
        result.current.saveDocument({ name: '문서2', content: '내용2' });
      });

      const doc = result.current.getDocument(doc1Id!);
      expect(doc?.name).toBe('문서1');
    });

    it('존재하지 않는 id는 undefined 반환', () => {
      const { result } = renderHook(() => useDocuments());
      const doc = result.current.getDocument('non-existent');
      expect(doc).toBeUndefined();
    });
  });

  describe('문서 삭제', () => {
    it('문서를 삭제할 수 있다', () => {
      const { result } = renderHook(() => useDocuments());

      act(() => {
        result.current.saveDocument({ name: '삭제할 문서', content: '내용' });
      });

      const docId = result.current.documents[0].id;

      act(() => {
        result.current.deleteDocument(docId);
      });

      expect(result.current.documents).toHaveLength(0);
    });
  });

  describe('문서 업데이트', () => {
    it('기존 문서 내용을 업데이트할 수 있다', () => {
      const { result } = renderHook(() => useDocuments());

      act(() => {
        result.current.saveDocument({ name: '문서', content: '원래 내용' });
      });

      const docId = result.current.documents[0].id;

      act(() => {
        result.current.updateDocument(docId, { content: '수정된 내용' });
      });

      expect(result.current.documents[0].content).toBe('수정된 내용');
    });

    it('업데이트 시 updatedAt이 갱신된다', () => {
      const { result } = renderHook(() => useDocuments());

      act(() => {
        result.current.saveDocument({ content: '내용' });
      });

      const originalUpdatedAt = result.current.documents[0].updatedAt;

      // 시간 차이를 위해 잠시 대기
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      act(() => {
        result.current.updateDocument(result.current.documents[0].id, {
          content: '수정',
        });
      });

      vi.useRealTimers();

      expect(result.current.documents[0].updatedAt).not.toBe(originalUpdatedAt);
    });
  });
});
