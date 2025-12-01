import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { TourOverlay } from './TourOverlay';
import { TourTooltip } from './TourTooltip';
import { TOUR_STEPS } from './tourSteps';
import styles from './ProductTour.module.css';

interface ProductTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  startStep?: number;
}

export function ProductTour({
  isActive,
  onComplete,
  onSkip,
  startStep = 0,
}: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(startStep);

  const totalSteps = TOUR_STEPS.length;
  const currentStepData = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // 스텝 초기화
  useEffect(() => {
    if (isActive) {
      setCurrentStep(startStep);
    }
  }, [isActive, startStep]);

  // 다음 스텝
  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  // 이전 스텝
  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive) return;

      switch (event.key) {
        case 'Escape':
          onSkip();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          if (!isLastStep) {
            handleNext();
          }
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          if (!isFirstStep) {
            handlePrev();
          }
          break;
        case ' ':  // 스페이스바
        case 'Enter':
          event.preventDefault();
          if (isLastStep) {
            onComplete();
          } else {
            handleNext();
          }
          break;
      }
    },
    [isActive, isLastStep, isFirstStep, handleNext, handlePrev, onSkip, onComplete]
  );

  // 키보드 이벤트 등록
  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isActive, handleKeyDown]);

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

  if (!isActive) {
    return null;
  }

  const tourContent = (
    <div
      className={styles.tourContainer}
      role="dialog"
      aria-modal="true"
      aria-label="제품 투어"
      aria-describedby="tour-step-description"
    >
      <TourOverlay
        targetSelector={currentStepData.target}
        isVisible={true}
      />

      <TourTooltip
        step={currentStepData}
        currentIndex={currentStep}
        totalSteps={totalSteps}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onPrev={handlePrev}
        onNext={handleNext}
        onSkip={onSkip}
        onComplete={onComplete}
      />
    </div>
  );

  // Portal을 사용하여 body 최상단에 렌더링
  return createPortal(tourContent, document.body);
}
