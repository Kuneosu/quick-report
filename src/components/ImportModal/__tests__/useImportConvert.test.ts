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

  describe('▶/-/+ 형식 파싱 (정확한 들여쓰기)', () => {
    it('기본 형식을 올바르게 파싱한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `▶ 프로젝트A
  - 활동1
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

    it('정확히 2칸 들여쓰기 + - 를 활동으로 인식한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `▶ 프로젝트
  - 활동 (2칸 들여쓰기)`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.convertedText).toContain('## 활동 (2칸 들여쓰기)');
    });

    it('정확히 4칸 들여쓰기 + + 를 작업으로 인식한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `▶ 프로젝트
  - 활동
    + 작업 (4칸 들여쓰기)`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.convertedText).toContain('### 작업 (4칸 들여쓰기)');
    });
  });

  describe('#/##/### 형식 파싱', () => {
    it('마크다운 형식을 올바르게 파싱한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `# 프로젝트B
## 활동2
### 작업2`;

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
    });
  });

  describe('Level 4 (세부내용) 파싱', () => {
    it('6칸 들여쓰기 + . 를 세부내용으로 인식한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `▶ 스터디
  - Multi Agent System 구축
    + 결과물 퀄리티 테스트용 프로젝트 구현
      . 핵심 기능 구현 완료
      . 부가 기능 구현`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.convertedText).toContain('# 스터디');
      expect(result.current.convertedText).toContain('## Multi Agent System 구축');
      expect(result.current.convertedText).toContain('### 결과물 퀄리티 테스트용 프로젝트 구현');
      expect(result.current.convertedText).toContain('#### 핵심 기능 구현 완료');
      expect(result.current.convertedText).toContain('#### 부가 기능 구현');
    });

    it('마크다운 #### 형식도 세부내용으로 인식한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `# 프로젝트
## 활동
### 작업
#### 세부내용1
#### 세부내용2`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.convertedText).toContain('#### 세부내용1');
      expect(result.current.convertedText).toContain('#### 세부내용2');
    });

    it('중복된 세부내용은 제거한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `▶ 프로젝트
  - 활동
    + 작업
      . 동일세부
      . 동일세부`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      // 중복 제거되어 한 번만 나타나야 함
      const matches = result.current.convertedText.match(/#### 동일세부/g);
      expect(matches).toHaveLength(1);
      expect(result.current.stats.duplicatesRemoved).toBe(1);
    });
  });

  describe('따옴표 제거 (전처리)', () => {
    it('줄 시작/끝의 따옴표를 제거한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `"▶ 프로젝트
  - 활동
    + 작업"`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.convertedText).toContain('# 프로젝트');
      expect(result.current.convertedText).not.toContain('"');
    });

    it('여러 날 보고서 구분자 따옴표를 제거한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `"▶ 프로젝트
  - 활동1
    + 작업1
"    "▶ 프로젝트
  - 활동2
    + 작업2"`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      // 프로젝트가 그룹핑되어 한 번만 나타나야 함
      const matches = result.current.convertedText.match(/# 프로젝트/g);
      expect(matches).toHaveLength(1);
      expect(result.current.convertedText).toContain('## 활동1');
      expect(result.current.convertedText).toContain('## 활동2');
    });

    it('이스케이프된 따옴표("")를 단일 따옴표로 복원한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `▶ 프로젝트
  - 개발
    + 기획전 리스트 ""유형"" 컬럼 추가`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.convertedText).toContain('### 기획전 리스트 "유형" 컬럼 추가');
    });

    it('▶ 앞에 줄바꿈이 없으면 줄바꿈을 추가한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      // 따옴표 제거 후 ▶ 앞에 줄바꿈이 사라지는 케이스
      const input = `"▶ 스터디
  - PMS 고도화 검토"    "▶ 꿀스테이
  - 회의"`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      // 스터디와 꿀스테이가 별도 프로젝트로 분리되어야 함
      expect(result.current.convertedText).toContain('# 스터디');
      expect(result.current.convertedText).toContain('## PMS 고도화 검토');
      expect(result.current.convertedText).toContain('# 꿀스테이');
      expect(result.current.convertedText).toContain('## 회의');
      expect(result.current.stats.projects).toBe(2);
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
    it('동일한 작업 중복을 제거한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `# 프로젝트A
## 활동1
### 동일작업
### 동일작업`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      // 중복제거 통계가 증가해야 함
      expect(result.current.stats.duplicatesRemoved).toBe(1);

      // 동일작업이 한 번만 나타나야 함
      const matches = result.current.convertedText.match(/### 동일작업/g);
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

  describe('실제 입력 케이스 (task 예시)', () => {
    it('여러 날 보고서 데이터를 올바르게 변환한다', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `"▶ 꿀스테이
  - 검토
    + 기획전 고도화 UID 및 개발건 검토

  - 개발
    + 기획전 리스트 ""유형"" 컬럼 추가
    + 기획전 패키지 등록 버튼 추가
"    "▶ 꿀스테이
  - 회의
    + 일시 : 25.11.25 (화) 10:30 ~ 11:30 / 14:00 ~ 15:00
    + 내용 : 주간회의

  - 검토
    + 기획전 고도화 UID 및 개발건 검토

  - 개발
    + 기획전의 게시글 등록/수정 팝업 신규 헤더 추가

▶ 스터디
  - PMS 고도화 검토"`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      // 꿀스테이가 한 번만 나타나야 함 (그룹핑)
      const projectMatches = result.current.convertedText.match(/# 꿀스테이/g);
      expect(projectMatches).toHaveLength(1);

      // 검토가 한 번만 나타나야 함 (그룹핑)
      const reviewMatches = result.current.convertedText.match(/## 검토/g);
      expect(reviewMatches).toHaveLength(1);

      // 개발이 한 번만 나타나야 함 (그룹핑)
      const devMatches = result.current.convertedText.match(/## 개발/g);
      expect(devMatches).toHaveLength(1);

      // 중복 작업이 한 번만 나타나야 함
      const dupTaskMatches = result.current.convertedText.match(/### 기획전 고도화 UID 및 개발건 검토/g);
      expect(dupTaskMatches).toHaveLength(1);

      // 이스케이프된 따옴표가 복원되어야 함
      expect(result.current.convertedText).toContain('### 기획전 리스트 "유형" 컬럼 추가');

      // 스터디 프로젝트가 있어야 함
      expect(result.current.convertedText).toContain('# 스터디');

      // 프로젝트 수 확인
      expect(result.current.stats.projects).toBe(2);

      // 중복 제거 확인 (검토 작업 중복)
      expect(result.current.stats.duplicatesRemoved).toBe(1);
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

  describe('인식되지 않는 형식 무시', () => {
    it('인식되지 않는 라인은 무시한다 (기타로 분류하지 않음)', async () => {
      const { result } = renderHook(() => useImportConvert());

      const input = `# 프로젝트
## 활동
### 작업
인식되지 않는 라인
다른 형식의 텍스트`;

      act(() => {
        result.current.setInputText(input);
      });

      await act(async () => {
        result.current.convert();
        await new Promise((r) => setTimeout(r, 10));
      });

      // "기타" 프로젝트가 없어야 함
      expect(result.current.convertedText).not.toContain('# 기타');
      expect(result.current.convertedText).not.toContain('인식되지 않는 라인');
    });
  });
});
