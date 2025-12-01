import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImportConvert } from '../useImportConvert';

describe('useImportConvert', () => {
  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정된다', () => {
      const { result } = renderHook(() => useImportConvert());

      expect(result.current.inputText).toBe('');
      expect(result.current.convertedText).toBe('');
      expect(result.current.stats).toEqual({
        projects: 0,
        groupings: 0,
        duplicatesRemoved: 0,
        totalLines: 0,
      });
      expect(result.current.errors).toEqual([]);
      expect(result.current.isConverting).toBe(false);
    });

    it('inputStats가 올바르게 계산된다', () => {
      const { result } = renderHook(() => useImportConvert());

      expect(result.current.inputStats).toEqual({ lines: 0, chars: 0 });

      act(() => {
        result.current.setInputText('line1\nline2\nline3');
      });

      expect(result.current.inputStats).toEqual({ lines: 3, chars: 17 });
    });
  });

  describe('▶/-/+/. 형식 파싱', () => {
    it('기본 형식을 올바르게 파싱한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `▶ 프로젝트A
  - 활동1
    + 작업1
      . 세부1`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.convertedText).toContain('# 프로젝트A');
      expect(result.current.convertedText).toContain('## 활동1');
      expect(result.current.convertedText).toContain('### 작업1');
      expect(result.current.convertedText).toContain('#### 세부1');
    });

    it('프로젝트-활동 복합 형식을 파싱한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `▶ 프로젝트A - 활동1
    + 작업1`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.convertedText).toContain('# 프로젝트A');
      expect(result.current.convertedText).toContain('## 활동1');
      expect(result.current.convertedText).toContain('### 작업1');
    });
  });

  describe('#/##/###/#### 형식 파싱', () => {
    it('마크다운 형식을 올바르게 파싱한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `# 프로젝트B
## 활동2
### 작업2
#### 세부2`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.convertedText).toContain('# 프로젝트B');
      expect(result.current.convertedText).toContain('## 활동2');
      expect(result.current.convertedText).toContain('### 작업2');
      expect(result.current.convertedText).toContain('#### 세부2');
    });
  });

  describe('그룹핑', () => {
    it('동일 프로젝트를 그룹핑한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `# 프로젝트A
## 활동1
### 작업1

# 프로젝트A
## 활동2
### 작업2`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      // 프로젝트A가 한 번만 나타나야 함
      const matches = result.current.convertedText.match(/# 프로젝트A/g);
      expect(matches).toHaveLength(1);

      // 그룹핑 통계가 증가해야 함
      expect(result.current.stats.groupings).toBeGreaterThan(0);
    });

    it('동일 활동을 그룹핑한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `# 프로젝트A
## 활동1
### 작업1

# 프로젝트A
## 활동1
### 작업2`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      // 활동1이 한 번만 나타나야 함
      const matches = result.current.convertedText.match(/## 활동1/g);
      expect(matches).toHaveLength(1);
    });
  });

  describe('중복 제거', () => {
    it('동일한 세부내용 중복을 제거한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `# 프로젝트A
## 활동1
### 작업1
#### 동일세부
#### 동일세부`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      // 중복제거 통계가 증가해야 함
      expect(result.current.stats.duplicatesRemoved).toBe(1);

      // 동일세부가 한 번만 나타나야 함
      const matches = result.current.convertedText.match(/#### 동일세부/g);
      expect(matches).toHaveLength(1);
    });
  });

  describe('통계', () => {
    it('프로젝트 수를 올바르게 계산한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `# 프로젝트A
## 활동1
### 작업1

# 프로젝트B
## 활동2
### 작업2`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.stats.projects).toBe(2);
    });

    it('총 라인 수를 올바르게 계산한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `# 프로젝트A
## 활동1
### 작업1`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.stats.totalLines).toBe(3);
    });
  });

  describe('reset', () => {
    it('모든 상태를 초기화한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      // 데이터 입력 및 변환
      act(() => {
        result.current.setInputText('# 테스트\n## 활동\n### 작업');
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.convertedText).not.toBe('');

      // 리셋
      act(() => {
        result.current.reset();
      });

      expect(result.current.inputText).toBe('');
      expect(result.current.convertedText).toBe('');
      expect(result.current.stats).toEqual({
        projects: 0,
        groupings: 0,
        duplicatesRemoved: 0,
        totalLines: 0,
      });
    });
  });

  describe('빈 입력 처리', () => {
    it('빈 입력에서 변환하면 빈 결과를 반환한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.convertedText).toBe('');
      expect(result.current.stats.projects).toBe(0);
    });

    it('공백만 있는 입력에서 변환하면 빈 결과를 반환한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      act(() => {
        result.current.setInputText('   \n   \n   ');
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.convertedText).toBe('');
    });
  });
});
