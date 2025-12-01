/**
 * 프리셋 레벨 설정
 */
export interface LevelConfig {
  level: 1 | 2 | 3 | 4;
  prefix: string;
  indent: number;
}

/**
 * 프리셋 설정
 */
export interface Preset {
  id: string;
  name: string;
  levels: LevelConfig[];
  isBuiltIn?: boolean;
}

/**
 * 기본 프리셋 - 현재 형식
 */
export const DEFAULT_PRESET: Preset = {
  id: 'default',
  name: '기본 형식',
  levels: [
    { level: 1, prefix: '▶', indent: 0 },
    { level: 2, prefix: '-', indent: 2 },
    { level: 3, prefix: '+', indent: 4 },
    { level: 4, prefix: '.', indent: 6 },
  ],
  isBuiltIn: true,
};

/**
 * 번호 형식 프리셋
 */
export const NUMBERED_PRESET: Preset = {
  id: 'numbered',
  name: '번호 형식',
  levels: [
    { level: 1, prefix: '▶', indent: 0 },
    { level: 2, prefix: '1.', indent: 2 },
    { level: 3, prefix: '-', indent: 4 },
    { level: 4, prefix: '+', indent: 6 },
  ],
  isBuiltIn: true,
};

/**
 * 화살표 형식 프리셋
 */
export const ARROW_PRESET: Preset = {
  id: 'arrow',
  name: '화살표 형식',
  levels: [
    { level: 1, prefix: '▶', indent: 0 },
    { level: 2, prefix: '→', indent: 2 },
    { level: 3, prefix: '→', indent: 4 },
    { level: 4, prefix: '→', indent: 6 },
  ],
  isBuiltIn: true,
};

/**
 * 기본 제공 프리셋 목록
 */
export const BUILT_IN_PRESETS: Preset[] = [
  DEFAULT_PRESET,
  NUMBERED_PRESET,
  ARROW_PRESET,
];
