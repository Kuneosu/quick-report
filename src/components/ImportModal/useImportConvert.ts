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

interface ParsedData {
  [project: string]: {
    [activity: string]: Map<string, Set<string>>;
  };
}

interface GroupingCounter {
  groupings: number;
  duplicates: number;
}

function parseAndGroup(input: string): { data: ParsedData; counter: GroupingCounter; errors: ConversionError[] } {
  const lines = input.split('\n');
  const data: ParsedData = {};
  const errors: ConversionError[] = [];
  const counter: GroupingCounter = { groupings: 0, duplicates: 0 };

  let currentProject = '';
  let currentActivity = '';
  let currentTask = '';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // # 프로젝트 또는 ▶ 프로젝트 (Level 1)
    if (trimmed.startsWith('# ') || trimmed.startsWith('▶')) {
      const withoutMarker = trimmed.replace(/^#\s*/, '').replace(/^▶\s*/, '').trim();

      // "프로젝트 - 활동" 형식 처리
      const dashIndex = withoutMarker.indexOf('-');
      if (dashIndex > 0) {
        currentProject = withoutMarker.substring(0, dashIndex).trim();
        currentActivity = withoutMarker.substring(dashIndex + 1).trim();
      } else {
        currentProject = withoutMarker;
        currentActivity = '';
      }

      // 기존 프로젝트 그룹핑 카운트
      if (data[currentProject]) {
        counter.groupings++;
      } else {
        data[currentProject] = {};
      }

      if (currentActivity) {
        if (data[currentProject][currentActivity]) {
          counter.groupings++;
        } else {
          data[currentProject][currentActivity] = new Map();
        }
      }
      currentTask = '';
      continue;
    }

    // ## 작업구분 또는 - 작업구분 (Level 2)
    // 들여쓰기 2칸으로 시작하는 - 도 처리
    const level2Match = rawLine.match(/^(\s{0,2})-\s+(.+)$/) || trimmed.match(/^##\s+(.+)$/);
    if (level2Match || trimmed.startsWith('## ')) {
      const activityText = trimmed.startsWith('## ')
        ? trimmed.replace(/^##\s*/, '').trim()
        : (level2Match ? (level2Match[2] || level2Match[1]).trim() : trimmed.replace(/^-\s*/, '').trim());

      currentActivity = activityText;

      if (currentProject) {
        if (data[currentProject][currentActivity]) {
          counter.groupings++;
        } else {
          data[currentProject][currentActivity] = new Map();
        }
      }
      currentTask = '';
      continue;
    }

    // ### 작업내용 또는 + 작업내용 (Level 3)
    // 들여쓰기 4칸으로 시작하는 + 도 처리
    const level3Match = rawLine.match(/^(\s{2,4})\+\s+(.+)$/) || trimmed.match(/^###\s+(.+)$/);
    if (level3Match || trimmed.startsWith('### ') || trimmed.startsWith('+')) {
      const taskText = trimmed.startsWith('### ')
        ? trimmed.replace(/^###\s*/, '').trim()
        : (level3Match ? level3Match[2].trim() : trimmed.replace(/^\+\s*/, '').trim());

      currentTask = taskText;

      if (currentProject && currentActivity) {
        const activityMap = data[currentProject][currentActivity];
        if (activityMap.has(currentTask)) {
          counter.groupings++;
        } else {
          activityMap.set(currentTask, new Set());
        }
      }
      continue;
    }

    // #### 세부내용 또는 . 세부내용 (Level 4)
    // 들여쓰기 6칸으로 시작하는 . 도 처리
    const level4Match = rawLine.match(/^(\s{4,6})\.\s+(.+)$/) || trimmed.match(/^####\s+(.+)$/);
    if (level4Match || trimmed.startsWith('#### ') || trimmed.startsWith('.')) {
      const detailText = trimmed.startsWith('#### ')
        ? trimmed.replace(/^####\s*/, '').trim()
        : (level4Match ? level4Match[2].trim() : trimmed.replace(/^\.\s*/, '').trim());

      if (currentProject && currentActivity && currentTask) {
        const taskSet = data[currentProject][currentActivity].get(currentTask);
        if (taskSet) {
          if (taskSet.has(detailText)) {
            counter.duplicates++;
          } else {
            taskSet.add(detailText);
          }
        }
      }
      continue;
    }

    // 인식되지 않은 형식 - 기타로 분류
    if (!data['기타']) data['기타'] = {};
    if (!data['기타']['항목']) data['기타']['항목'] = new Map();

    const otherMap = data['기타']['항목'];
    if (!otherMap.has(trimmed)) {
      otherMap.set(trimmed, new Set());
    }
  }

  return { data, counter, errors };
}

function formatOutput(data: ParsedData): string {
  const lines: string[] = [];

  for (const [project, activities] of Object.entries(data)) {
    // 빈 프로젝트 건너뛰기
    const hasContent = Object.values(activities).some(tasks => tasks.size > 0);
    if (!hasContent) continue;

    lines.push(`# ${project}`);

    for (const [activity, tasks] of Object.entries(activities)) {
      if (tasks.size === 0) continue;

      lines.push(`## ${activity}`);

      for (const [task, details] of tasks.entries()) {
        lines.push(`### ${task}`);
        for (const detail of details) {
          lines.push(`#### ${detail}`);
        }
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
        (p) => Object.values(data[p]).some((tasks) => tasks.size > 0)
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
