import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductTour } from '../ProductTour';
import { TOUR_STEPS } from '../tourSteps';

// scrollIntoView mock
Element.prototype.scrollIntoView = vi.fn();

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// 타겟 요소 mock 생성
function setupTargetElements() {
  const targets = [
    { id: 'editor-panel', tour: 'editor' },
    { id: 'preview-panel', tour: 'preview' },
    { id: 'copy-button', tour: 'copy', testid: 'copy-button' },
    { id: 'sidebar', tour: 'sidebar', testid: 'sidebar' },
    { id: 'settings-button', tour: 'settings', testid: 'settings-button' },
    { id: 'guide-button', tour: 'guide', testid: 'guide-button' },
  ];

  targets.forEach(({ id, tour, testid }) => {
    const el = document.createElement('div');
    el.id = id;
    el.setAttribute('data-tour', tour);
    if (testid) {
      el.setAttribute('data-testid', testid);
    }
    el.style.position = 'absolute';
    el.style.top = '100px';
    el.style.left = '100px';
    el.style.width = '200px';
    el.style.height = '100px';
    document.body.appendChild(el);
  });
}

function cleanupTargetElements() {
  // Portal로 렌더링된 요소들만 제거 (테스트 컨테이너 제외)
  const portalElements = document.body.querySelectorAll('[data-testid="tour-overlay"], .tourContainer');
  portalElements.forEach(el => el.remove());

  // 타겟 요소들 제거
  const targetElements = document.body.querySelectorAll('[data-tour]');
  targetElements.forEach(el => el.remove());
}

describe('ProductTour', () => {
  beforeEach(() => {
    localStorageMock.clear();
    setupTargetElements();
  });

  afterEach(() => {
    cleanupTargetElements();
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('isActive가 true일 때 투어가 표시된다', () => {
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('isActive가 false일 때 투어가 표시되지 않는다', () => {
      render(<ProductTour isActive={false} onComplete={() => {}} onSkip={() => {}} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('첫 번째 스텝의 제목이 표시된다', () => {
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);
      expect(screen.getByText(TOUR_STEPS[0].title)).toBeInTheDocument();
    });

    it('첫 번째 스텝의 설명이 표시된다', () => {
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);
      expect(screen.getByText(TOUR_STEPS[0].description)).toBeInTheDocument();
    });

    it('진행 상태가 표시된다 (1/7)', () => {
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);
      expect(screen.getByText(/1.*7/)).toBeInTheDocument();
    });
  });

  describe('네비게이션', () => {
    it('다음 버튼 클릭 시 다음 스텝으로 이동한다', async () => {
      const user = userEvent.setup();
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);

      await user.click(screen.getByRole('button', { name: /다음/i }));

      await waitFor(() => {
        expect(screen.getByText(TOUR_STEPS[1].title)).toBeInTheDocument();
      });
    });

    it('이전 버튼 클릭 시 이전 스텝으로 이동한다', async () => {
      const user = userEvent.setup();
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);

      // 다음 스텝으로 이동
      await user.click(screen.getByRole('button', { name: /다음/i }));
      await waitFor(() => {
        expect(screen.getByText(TOUR_STEPS[1].title)).toBeInTheDocument();
      });

      // 이전 스텝으로 돌아가기
      await user.click(screen.getByRole('button', { name: /이전/i }));
      await waitFor(() => {
        expect(screen.getByText(TOUR_STEPS[0].title)).toBeInTheDocument();
      });
    });

    it('첫 번째 스텝에서 이전 버튼이 비활성화된다', () => {
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);
      expect(screen.getByRole('button', { name: /이전/i })).toBeDisabled();
    });

    it('마지막 스텝에서 버튼이 완료로 변경된다', async () => {
      const user = userEvent.setup();
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);

      // 마지막 스텝까지 이동
      for (let i = 0; i < TOUR_STEPS.length - 1; i++) {
        await user.click(screen.getByRole('button', { name: /다음/i }));
      }

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /완료/i })).toBeInTheDocument();
      });
    });

    it('완료 버튼 클릭 시 onComplete 호출', async () => {
      const user = userEvent.setup();
      const handleComplete = vi.fn();
      render(<ProductTour isActive={true} onComplete={handleComplete} onSkip={() => {}} />);

      // 마지막 스텝까지 이동
      for (let i = 0; i < TOUR_STEPS.length - 1; i++) {
        await user.click(screen.getByRole('button', { name: /다음/i }));
      }

      await user.click(screen.getByRole('button', { name: /완료/i }));
      expect(handleComplete).toHaveBeenCalled();
    });

    it('건너뛰기 버튼 클릭 시 onSkip 호출', async () => {
      const user = userEvent.setup();
      const handleSkip = vi.fn();
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={handleSkip} />);

      await user.click(screen.getByRole('button', { name: /건너뛰기/i }));
      expect(handleSkip).toHaveBeenCalled();
    });
  });

  describe('키보드 네비게이션', () => {
    it('ESC 키로 투어를 종료할 수 있다', async () => {
      const user = userEvent.setup();
      const handleSkip = vi.fn();
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={handleSkip} />);

      await user.keyboard('{Escape}');
      expect(handleSkip).toHaveBeenCalled();
    });

    it('오른쪽 화살표 키로 다음 스텝으로 이동한다', async () => {
      const user = userEvent.setup();
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);

      await user.keyboard('{ArrowRight}');

      await waitFor(() => {
        expect(screen.getByText(TOUR_STEPS[1].title)).toBeInTheDocument();
      });
    });

    it('왼쪽 화살표 키로 이전 스텝으로 이동한다', async () => {
      const user = userEvent.setup();
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);

      // 다음 스텝으로 이동
      await user.keyboard('{ArrowRight}');
      await waitFor(() => {
        expect(screen.getByText(TOUR_STEPS[1].title)).toBeInTheDocument();
      });

      // 이전 스텝으로 돌아가기
      await user.keyboard('{ArrowLeft}');
      await waitFor(() => {
        expect(screen.getByText(TOUR_STEPS[0].title)).toBeInTheDocument();
      });
    });

    it('스페이스바로 다음 스텝으로 이동한다', async () => {
      const user = userEvent.setup();
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);

      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByText(TOUR_STEPS[1].title)).toBeInTheDocument();
      });
    });

    it('엔터키로 다음 스텝으로 이동한다', async () => {
      const user = userEvent.setup();
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(TOUR_STEPS[1].title)).toBeInTheDocument();
      });
    });

    it('마지막 스텝에서 엔터키로 완료한다', async () => {
      const user = userEvent.setup();
      const handleComplete = vi.fn();
      render(<ProductTour isActive={true} onComplete={handleComplete} onSkip={() => {}} />);

      // 마지막 스텝까지 이동
      for (let i = 0; i < TOUR_STEPS.length - 1; i++) {
        await user.keyboard('{Enter}');
      }

      // 마지막 스텝에서 엔터
      await user.keyboard('{Enter}');
      expect(handleComplete).toHaveBeenCalled();
    });
  });

  describe('접근성', () => {
    it('role="dialog"가 설정되어 있다', () => {
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('aria-modal이 true로 설정되어 있다', () => {
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('aria-label이 설정되어 있다', () => {
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '제품 투어');
    });

    it('aria-live 영역이 있다', () => {
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);
      expect(screen.getByRole('dialog').querySelector('[aria-live="polite"]')).toBeInTheDocument();
    });
  });

  describe('진행 인디케이터', () => {
    it('6개의 진행 인디케이터가 표시된다', () => {
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);
      const indicators = screen.getAllByTestId(/step-indicator/);
      expect(indicators).toHaveLength(TOUR_STEPS.length);
    });

    it('현재 스텝 인디케이터가 활성화된다', () => {
      render(<ProductTour isActive={true} onComplete={() => {}} onSkip={() => {}} />);
      const activeIndicator = screen.getByTestId('step-indicator-0');
      expect(activeIndicator).toHaveAttribute('data-active', 'true');
    });
  });
});

describe('tourSteps', () => {
  it('7개의 스텝이 정의되어 있다', () => {
    expect(TOUR_STEPS).toHaveLength(7);
  });

  it('각 스텝에 필수 필드가 있다', () => {
    TOUR_STEPS.forEach((step) => {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('target');
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('description');
      expect(step).toHaveProperty('position');
    });
  });

  it('스텝 순서: 에디터 → 미리보기 → 복사 → 사이드바 → 불러오기 → 설정 → 가이드', () => {
    expect(TOUR_STEPS[0].id).toBe('editor');
    expect(TOUR_STEPS[1].id).toBe('preview');
    expect(TOUR_STEPS[2].id).toBe('copy');
    expect(TOUR_STEPS[3].id).toBe('sidebar');
    expect(TOUR_STEPS[4].id).toBe('import');
    expect(TOUR_STEPS[5].id).toBe('settings');
    expect(TOUR_STEPS[6].id).toBe('guide');
  });
});
