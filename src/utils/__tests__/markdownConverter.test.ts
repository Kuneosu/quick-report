import { describe, it, expect } from 'vitest';
import { convertMarkdownToReport, convertWithConfig } from '../markdownConverter';
import type { LevelConfig } from '../../types/preset';

describe('convertMarkdownToReport', () => {
  describe('H1 변환 (# → ▶)', () => {
    it('# 제목을 ▶ 제목으로 변환한다', () => {
      const input = '# 주간 업무 보고';
      const expected = '▶ 주간 업무 보고';
      expect(convertMarkdownToReport(input)).toBe(expected);
    });

    it('H1이 여러 개일 때 각각 ▶로 변환한다', () => {
      const input = '# 보고서1\n# 보고서2';
      const expected = '▶ 보고서1\n▶ 보고서2';
      expect(convertMarkdownToReport(input)).toBe(expected);
    });
  });

  describe('H2 변환 (## → -)', () => {
    it('## 제목을 2칸 들여쓰기 + -로 변환한다', () => {
      const input = '## 회의';
      const expected = '  - 회의';
      expect(convertMarkdownToReport(input)).toBe(expected);
    });

    it('H2가 연속될 때 모두 -로 변환한다', () => {
      const input = '## 회의\n## 개발\n## 테스트';
      const expected = '  - 회의\n  - 개발\n  - 테스트';
      expect(convertMarkdownToReport(input)).toBe(expected);
    });

    it('H1 이후에 H2가 -로 변환된다', () => {
      const input = '# 1주차\n## 항목1\n## 항목2\n# 2주차\n## 항목1';
      const expected = '▶ 1주차\n  - 항목1\n  - 항목2\n▶ 2주차\n  - 항목1';
      expect(convertMarkdownToReport(input)).toBe(expected);
    });
  });

  describe('H3 변환 (### → +)', () => {
    it('### 항목을 4칸 들여쓰기 + +로 변환한다', () => {
      const input = '### 세부 항목';
      const expected = '    + 세부 항목';
      expect(convertMarkdownToReport(input)).toBe(expected);
    });
  });

  describe('H4 변환 (#### → .)', () => {
    it('#### 항목을 6칸 들여쓰기 + .로 변환한다', () => {
      const input = '#### 하위 항목';
      const expected = '      . 하위 항목';
      expect(convertMarkdownToReport(input)).toBe(expected);
    });
  });

  describe('복합 변환', () => {
    it('전체 계층 구조가 올바르게 변환된다', () => {
      const input = `# 주간 업무 보고
## 회의
### 일시 : 2024-11-27
### 내용 : 프로젝트 킥오프
## 개발
### API 설계
#### 엔드포인트 정의
#### 스키마 작성`;

      const expected = `▶ 주간 업무 보고
  - 회의
    + 일시 : 2024-11-27
    + 내용 : 프로젝트 킥오프
  - 개발
    + API 설계
      . 엔드포인트 정의
      . 스키마 작성`;

      expect(convertMarkdownToReport(input)).toBe(expected);
    });
  });

  describe('빈 줄 처리', () => {
    it('빈 줄은 그대로 유지된다', () => {
      const input = '# 제목\n\n## 항목';
      const expected = '▶ 제목\n\n  - 항목';
      expect(convertMarkdownToReport(input)).toBe(expected);
    });
  });

  describe('일반 텍스트 처리', () => {
    it('헤딩이 아닌 텍스트는 그대로 유지된다', () => {
      const input = '일반 텍스트입니다';
      const expected = '일반 텍스트입니다';
      expect(convertMarkdownToReport(input)).toBe(expected);
    });

    it('#으로 시작하지 않는 줄은 변환하지 않는다', () => {
      const input = '이것은 #해시태그 입니다';
      expect(convertMarkdownToReport(input)).toBe(input);
    });
  });

  describe('엣지 케이스', () => {
    it('빈 문자열 입력 시 빈 문자열 반환', () => {
      expect(convertMarkdownToReport('')).toBe('');
    });

    it('공백만 있는 헤딩 처리', () => {
      const input = '# ';
      const expected = '▶ ';
      expect(convertMarkdownToReport(input)).toBe(expected);
    });

    it('# 다음에 공백 없이 텍스트가 오면 변환하지 않는다', () => {
      const input = '#태그';
      expect(convertMarkdownToReport(input)).toBe('#태그');
    });
  });
});

describe('convertWithConfig', () => {
  const customConfig: LevelConfig[] = [
    { level: 1, prefix: '★', indent: 0 },
    { level: 2, prefix: '●', indent: 3 },
    { level: 3, prefix: '○', indent: 6 },
    { level: 4, prefix: '·', indent: 9 },
  ];

  describe('커스텀 접두사 변환', () => {
    it('H1이 커스텀 접두사로 변환된다', () => {
      const input = '# 제목';
      const expected = '★ 제목';
      expect(convertWithConfig(input, customConfig)).toBe(expected);
    });

    it('H2가 커스텀 접두사와 들여쓰기로 변환된다', () => {
      const input = '## 항목';
      const expected = '   ● 항목';
      expect(convertWithConfig(input, customConfig)).toBe(expected);
    });

    it('H3가 커스텀 접두사와 들여쓰기로 변환된다', () => {
      const input = '### 세부';
      const expected = '      ○ 세부';
      expect(convertWithConfig(input, customConfig)).toBe(expected);
    });

    it('H4가 커스텀 접두사와 들여쓰기로 변환된다', () => {
      const input = '#### 하위';
      const expected = '         · 하위';
      expect(convertWithConfig(input, customConfig)).toBe(expected);
    });
  });

  describe('복합 커스텀 변환', () => {
    it('전체 계층이 커스텀 설정으로 변환된다', () => {
      const input = `# 제목
## 카테고리
### 항목
#### 세부`;

      const expected = `★ 제목
   ● 카테고리
      ○ 항목
         · 세부`;

      expect(convertWithConfig(input, customConfig)).toBe(expected);
    });
  });

  describe('번호 형식 프리셋', () => {
    const numberedConfig: LevelConfig[] = [
      { level: 1, prefix: '▶', indent: 0 },
      { level: 2, prefix: '1.', indent: 2 },
      { level: 3, prefix: '-', indent: 4 },
      { level: 4, prefix: '+', indent: 6 },
    ];

    it('번호 형식으로 변환된다', () => {
      const input = '# 제목\n## 항목';
      const expected = '▶ 제목\n  1. 항목';
      expect(convertWithConfig(input, numberedConfig)).toBe(expected);
    });
  });

  describe('빈 설정 처리', () => {
    it('설정이 없으면 기본 설정으로 변환된다', () => {
      const input = '# 제목';
      expect(convertWithConfig(input, [])).toBe('▶ 제목');
    });
  });
});
