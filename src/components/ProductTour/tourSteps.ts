export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'bottom-left' | 'bottom-right';

export interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  description: string;
  position: TooltipPosition;
  mobilePosition?: TooltipPosition;
  mobileAction?: 'switch-to-editor' | 'switch-to-preview' | 'open-sidebar';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'editor',
    target: '[data-tour="editor"], #editor-panel',
    title: '보고서 변환 에디터',
    description: '마크다운 헤딩(#, ##, ###, ####)을 업무보고 형식으로 변환합니다. 빈 줄에서 /1, /2, /3, /4를 입력하면 해당 레벨의 헤딩이 자동 입력됩니다.',
    position: 'right',
    mobilePosition: 'bottom',
    mobileAction: 'switch-to-editor',
  },
  {
    id: 'preview',
    target: '[data-tour="preview"], #preview-panel',
    title: '실시간 미리보기',
    description: '입력한 마크다운이 업무보고 형식으로 자동 변환됩니다. 실시간으로 결과를 확인하세요.',
    position: 'left',
    mobilePosition: 'bottom',
    mobileAction: 'switch-to-preview',
  },
  {
    id: 'copy',
    target: '[data-tour="copy"], [data-testid="copy-button"]',
    title: '클립보드 복사',
    description: '변환된 결과를 클립보드에 복사합니다. 이메일이나 문서에 바로 붙여넣기 하세요.',
    position: 'bottom',
    mobilePosition: 'bottom',
  },
  {
    id: 'sidebar',
    target: '[data-tour="sidebar"], [data-testid="sidebar"]',
    title: '문서 관리',
    description: '작성한 문서를 저장하고 관리할 수 있습니다. 자주 사용하는 문서를 저장해두세요.',
    position: 'right',
    mobileAction: 'open-sidebar',
  },
  {
    id: 'import',
    target: '[data-tour="import"], [data-testid="import-button"]',
    title: '데이터 불러오기',
    description: '기존 보고서 데이터를 불러와 자동으로 그룹핑하고 중복을 제거합니다. 여러 날의 보고서를 한 번에 병합할 수 있습니다.',
    position: 'bottom-left',
  },
  {
    id: 'settings',
    target: '[data-tour="settings"], [data-testid="settings-button"]',
    title: '변환 설정',
    description: '제목 레벨별 변환 형식을 커스터마이징할 수 있습니다. 나만의 프리셋을 만들어보세요.',
    position: 'bottom-left',
  },
  {
    id: 'guide',
    target: '[data-tour="guide"], [data-testid="guide-button"]',
    title: '도움말',
    description: '마크다운 문법 가이드와 투어를 다시 볼 수 있습니다. 사용법이 궁금할 때 언제든 클릭하세요!',
    position: 'bottom-left',
  },
];

export const TOUR_VERSION = '1.1.0';
export const TOUR_STORAGE_KEY = 'quickreport-tour-shown';
export const TOUR_VERSION_KEY = 'quickreport-tour-version';
