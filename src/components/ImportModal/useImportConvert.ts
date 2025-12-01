import { useState, useCallback, useMemo } from 'react';

export interface ConversionStats {
  projects: number;
  groupings: number;
  duplicatesRemoved: number;
  totalLines: number;
}

export interface ConversionError {
  line: number;
  message: string;
  original: string;
}

export interface ConversionResult {
  text: string;
  stats: ConversionStats;
  errors: ConversionError[];
}

// 단순화된 데이터 구조 (Level 3까지만 사용)
interface ParsedData {
  [project: string]: {
    [activity: string]: Set<string>;
  };
}

interface GroupingCounter {
  groupings: number;
  duplicates: number;
}

// 전처리: 따옴표 제거 및 줄바꿈 정규화
function preprocessInput(input: string): string {
  // 처리 순서가 중요:
  // 1. 먼저 이스케이프된 따옴표("")를 임시 플레이스홀더로 변환
  // 2. 구분자 따옴표 제거
  // 3. 플레이스홀더를 단일 따옴표로 복원
  // 4. ▶ 앞에 줄바꿈이 없으면 추가
  const PLACEHOLDER = '\u0000QUOTE\u0000';

  return input
    .replace(/""/g, PLACEHOLDER) // 이스케이프된 따옴표를 플레이스홀더로
    .replace(/"\s*"/g, '') // 줄 사이 구분자 따옴표 제거
    .replace(/^"/gm, '') // 줄 시작 따옴표 제거
    .replace(/"$/gm, '') // 줄 끝 따옴표 제거
    .replace(new RegExp(PLACEHOLDER, 'g'), '"') // 플레이스홀더를 단일 따옴표로 복원
    .replace(/([^\n])▶/g, '$1\n▶'); // ▶ 앞에 줄바꿈이 없으면 추가
}

function parseAndGroup(input: string): { data: ParsedData; counter: GroupingCounter; errors: ConversionError[] } {
  // 전처리: 따옴표 제거
  const preprocessed = preprocessInput(input);
  const lines = preprocessed.split('\n');
  const data: ParsedData = {};
  const errors: ConversionError[] = [];
  const counter: GroupingCounter = { groupings: 0, duplicates: 0 };

  let currentProject = '';
  let currentActivity = '';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Level 1: # 프로젝트 또는 ▶ 프로젝트 (들여쓰기 없음)
    if (trimmed.startsWith('# ') || trimmed.startsWith('▶')) {
      const withoutMarker = trimmed.replace(/^#\s*/, '').replace(/^▶\s*/, '').trim();
      currentProject = withoutMarker;
      currentActivity = '';

      // 기존 프로젝트 그룹핑 카운트
      if (data[currentProject]) {
        counter.groupings++;
      } else {
        data[currentProject] = {};
      }
      continue;
    }

    // Level 2: ## 활동명 또는 정확히 2칸 들여쓰기 + - 활동명
    const level2SymbolMatch = rawLine.match(/^  - (.+)$/);
    const level2MarkdownMatch = trimmed.match(/^## (.+)$/);

    if (level2SymbolMatch || level2MarkdownMatch) {
      const activityText = level2SymbolMatch
        ? level2SymbolMatch[1].trim()
        : level2MarkdownMatch![1].trim();

      currentActivity = activityText;

      if (currentProject) {
        if (data[currentProject][currentActivity]) {
          counter.groupings++;
        } else {
          data[currentProject][currentActivity] = new Set();
        }
      }
      continue;
    }

    // Level 3: ### 작업내용 또는 정확히 4칸 들여쓰기 + + 작업내용
    const level3SymbolMatch = rawLine.match(/^    \+ (.+)$/);
    const level3MarkdownMatch = trimmed.match(/^### (.+)$/);

    if (level3SymbolMatch || level3MarkdownMatch) {
      const taskText = level3SymbolMatch
        ? level3SymbolMatch[1].trim()
        : level3MarkdownMatch![1].trim();

      if (currentProject && currentActivity) {
        const activitySet = data[currentProject][currentActivity];
        if (activitySet.has(taskText)) {
          counter.duplicates++;
        } else {
          activitySet.add(taskText);
        }
      }
      continue;
    }

    // 인식되지 않은 형식은 무시 (기타로 분류하지 않음)
  }

  return { data, counter, errors };
}

function formatOutput(data: ParsedData): string {
  const lines: string[] = [];
  let isFirstProject = true;

  for (const [project, activities] of Object.entries(data)) {
    // 활동이 없는 프로젝트 건너뛰기
    if (Object.keys(activities).length === 0) continue;

    // 프로젝트 사이에 빈 줄 추가 (첫 번째 제외)
    if (!isFirstProject) {
      lines.push('');
    }
    isFirstProject = false;

    lines.push(`# ${project}`);

    let isFirstActivity = true;
    for (const [activity, tasks] of Object.entries(activities)) {
      // 활동 사이에 빈 줄 추가 (첫 번째 제외)
      if (!isFirstActivity) {
        lines.push('');
      }
      isFirstActivity = false;

      lines.push(`## ${activity}`);

      // 작업이 있는 경우만 출력
      for (const task of tasks) {
        lines.push(`### ${task}`);
      }
    }
  }

  return lines.join('\n');
}

export function useImportConvert() {
  const [inputText, setInputText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [stats, setStats] = useState<ConversionStats>({
    projects: 0,
    groupings: 0,
    duplicatesRemoved: 0,
    totalLines: 0,
  });
  const [errors, setErrors] = useState<ConversionError[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const convert = useCallback(() => {
    if (!inputText.trim()) {
      setConvertedText('');
      setStats({ projects: 0, groupings: 0, duplicatesRemoved: 0, totalLines: 0 });
      setErrors([]);
      return;
    }

    setIsConverting(true);

    // 비동기로 처리하여 UI 블로킹 방지
    setTimeout(() => {
      const { data, counter, errors: parseErrors } = parseAndGroup(inputText);
      const output = formatOutput(data);

      const projectCount = Object.keys(data).filter(
        (p) => Object.keys(data[p]).length > 0
      ).length;

      setConvertedText(output);
      setStats({
        projects: projectCount,
        groupings: counter.groupings,
        duplicatesRemoved: counter.duplicates,
        totalLines: output.split('\n').filter((l) => l.trim()).length,
      });
      setErrors(parseErrors);
      setIsConverting(false);
    }, 0);
  }, [inputText]);

  const reset = useCallback(() => {
    setInputText('');
    setConvertedText('');
    setStats({ projects: 0, groupings: 0, duplicatesRemoved: 0, totalLines: 0 });
    setErrors([]);
  }, []);

  const inputStats = useMemo(() => {
    const lines = inputText.split('\n').length;
    const chars = inputText.length;
    return { lines: inputText ? lines : 0, chars };
  }, [inputText]);

  return {
    inputText,
    setInputText,
    convertedText,
    stats,
    errors,
    isConverting,
    convert,
    reset,
    inputStats,
  };
}
