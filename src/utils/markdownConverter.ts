import type { LevelConfig } from '../types/preset';

/**
 * 기본 레벨 설정
 */
const DEFAULT_LEVELS: LevelConfig[] = [
  { level: 1, prefix: '▶', indent: 0 },
  { level: 2, prefix: '-', indent: 2 },
  { level: 3, prefix: '+', indent: 4 },
  { level: 4, prefix: '.', indent: 6 },
];

/**
 * 설정에서 특정 레벨의 설정을 가져오기
 */
function getLevelConfig(levels: LevelConfig[], level: 1 | 2 | 3 | 4): LevelConfig {
  const config = levels.find((l) => l.level === level);
  return config || DEFAULT_LEVELS.find((l) => l.level === level)!;
}

/**
 * 커스텀 설정으로 마크다운을 변환하는 함수
 */
export function convertWithConfig(markdown: string, levels: LevelConfig[]): string {
  if (markdown === '') {
    return '';
  }

  const configLevels = levels.length > 0 ? levels : DEFAULT_LEVELS;
  const lines = markdown.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('#### ')) {
      const config = getLevelConfig(configLevels, 4);
      const content = trimmed.slice(5);
      result.push(`${' '.repeat(config.indent)}${config.prefix} ${content}`);
    } else if (trimmed.startsWith('### ')) {
      const config = getLevelConfig(configLevels, 3);
      const content = trimmed.slice(4);
      result.push(`${' '.repeat(config.indent)}${config.prefix} ${content}`);
    } else if (trimmed.startsWith('## ')) {
      const config = getLevelConfig(configLevels, 2);
      const content = trimmed.slice(3);
      result.push(`${' '.repeat(config.indent)}${config.prefix} ${content}`);
    } else if (trimmed.startsWith('# ') || trimmed === '#') {
      const config = getLevelConfig(configLevels, 1);
      const content = trimmed.length > 2 ? trimmed.slice(2) : '';
      result.push(`${' '.repeat(config.indent)}${config.prefix} ${content}`);
    } else if (trimmed === '') {
      result.push('');
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

/**
 * 마크다운을 업무보고 형식으로 변환하는 함수 (기본 설정 사용)
 *
 * 변환 규칙:
 * - # (H1) → ▶ 0단계 (들여쓰기 없음)
 * - ## (H2) → - 1단계 (공백2칸 + 하이픈)
 * - ### (H3) → + 2단계 (공백4칸 + 플러스)
 * - #### (H4) → . 3단계 (공백6칸 + 마침표)
 */
export function convertMarkdownToReport(markdown: string): string {
  if (markdown === '') {
    return '';
  }

  const lines = markdown.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('#### ')) {
      // H4 → . 3단계 (6칸 들여쓰기)
      const content = trimmed.slice(5);
      result.push(`      . ${content}`);
    } else if (trimmed.startsWith('### ')) {
      // H3 → + 2단계 (4칸 들여쓰기)
      const content = trimmed.slice(4);
      result.push(`    + ${content}`);
    } else if (trimmed.startsWith('## ')) {
      // H2 → - 1단계 (2칸 들여쓰기)
      const content = trimmed.slice(3);
      result.push(`  - ${content}`);
    } else if (trimmed.startsWith('# ') || trimmed === '#') {
      // H1 → ▶ 0단계 (0칸)
      const content = trimmed.length > 2 ? trimmed.slice(2) : '';
      result.push(`▶ ${content}`);
    } else if (trimmed === '') {
      // 빈 줄 유지
      result.push('');
    } else {
      // 일반 텍스트는 그대로 유지
      result.push(line);
    }
  }

  return result.join('\n');
}
