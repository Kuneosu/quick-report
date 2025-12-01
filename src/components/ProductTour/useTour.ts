import { useState, useCallback, useEffect } from 'react';
import { TOUR_STEPS, TOUR_STORAGE_KEY, TOUR_VERSION, TOUR_VERSION_KEY } from './tourSteps';

interface UseTourOptions {
  onComplete?: () => void;
  onSkip?: () => void;
}

interface UseTourReturn {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: typeof TOUR_STEPS[0] | null;
  isFirstStep: boolean;
  isLastStep: boolean;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  shouldShowOnFirstVisit: () => boolean;
}

export function useTour(options: UseTourOptions = {}): UseTourReturn {
  const { onComplete, onSkip } = options;
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = TOUR_STEPS.length;
  const currentStepData = isActive ? TOUR_STEPS[currentStep] : null;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // 첫 방문 감지
  const shouldShowOnFirstVisit = useCallback(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    const savedVersion = localStorage.getItem(TOUR_VERSION_KEY);

    // 완료한 적이 없거나 버전이 다르면 투어 표시
    if (!completed || savedVersion !== TOUR_VERSION) {
      return true;
    }
    return false;
  }, []);

  // 투어 시작
  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  // 투어 종료 (내부용)
  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  // 다음 스텝
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  // 이전 스텝
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // 투어 건너뛰기
  const skipTour = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    localStorage.setItem(TOUR_VERSION_KEY, TOUR_VERSION);
    endTour();
    onSkip?.();
  }, [endTour, onSkip]);

  // 투어 완료
  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    localStorage.setItem(TOUR_VERSION_KEY, TOUR_VERSION);
    endTour();
    onComplete?.();
  }, [endTour, onComplete]);

  // 타겟 요소로 스크롤
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const targetElement = document.querySelector(currentStepData.target);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isActive, currentStepData]);

  return {
    isActive,
    currentStep,
    totalSteps,
    currentStepData,
    isFirstStep,
    isLastStep,
    startTour,
    endTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    shouldShowOnFirstVisit,
  };
}
