import { useEffect, useState, useCallback, useRef } from 'react';
import type { TooltipPosition, TourStep } from './tourSteps';
import styles from './ProductTour.module.css';

interface TooltipStyle {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  transform?: string;
}

interface TourTooltipProps {
  step: TourStep;
  currentIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

function calculatePosition(
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  position: TooltipPosition,
  padding: number = 16
): TooltipStyle {
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  switch (position) {
    case 'top':
      return {
        top: targetRect.top + scrollY - tooltipRect.height - padding,
        left: targetRect.left + scrollX + (targetRect.width - tooltipRect.width) / 2,
      };
    case 'bottom':
      return {
        top: targetRect.bottom + scrollY + padding,
        left: targetRect.left + scrollX + (targetRect.width - tooltipRect.width) / 2,
      };
    case 'left':
      return {
        top: targetRect.top + scrollY + (targetRect.height - tooltipRect.height) / 2,
        left: targetRect.left + scrollX - tooltipRect.width - padding,
      };
    case 'right':
      return {
        top: targetRect.top + scrollY + (targetRect.height - tooltipRect.height) / 2,
        left: targetRect.right + scrollX + padding,
      };
    case 'bottom-left':
      return {
        top: targetRect.bottom + scrollY + padding,
        left: targetRect.right + scrollX - tooltipRect.width,
      };
    case 'bottom-right':
      return {
        top: targetRect.bottom + scrollY + padding,
        left: targetRect.left + scrollX,
      };
    default:
      return {
        top: targetRect.bottom + scrollY + padding,
        left: targetRect.left + scrollX,
      };
  }
}

export function TourTooltip({
  step,
  currentIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  onPrev,
  onNext,
  onSkip,
  onComplete,
}: TourTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<TooltipStyle>({});

  const updatePosition = useCallback(() => {
    const target = document.querySelector(step.target);
    const tooltip = tooltipRef.current;

    if (!target || !tooltip) return;

    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    // 모바일 체크 (768px 미만)
    const isMobile = window.innerWidth < 768;
    const position = isMobile && step.mobilePosition ? step.mobilePosition : step.position;

    const style = calculatePosition(targetRect, tooltipRect, position);

    // 화면 경계 체크 및 조정
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (style.left !== undefined) {
      if (style.left < 10) {
        style.left = 10;
      } else if (style.left + tooltipRect.width > viewportWidth - 10) {
        style.left = viewportWidth - tooltipRect.width - 10;
      }
    }

    if (style.top !== undefined) {
      if (style.top < window.scrollY + 10) {
        style.top = window.scrollY + 10;
      } else if (style.top + tooltipRect.height > window.scrollY + viewportHeight - 10) {
        style.top = window.scrollY + viewportHeight - tooltipRect.height - 10;
      }
    }

    setTooltipStyle(style);
  }, [step]);

  useEffect(() => {
    // 초기 위치 설정 지연 (DOM 렌더링 대기)
    const timer = setTimeout(updatePosition, 50);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [updatePosition]);

  return (
    <div
      ref={tooltipRef}
      className={styles.tooltip}
      style={tooltipStyle}
      data-testid="tour-tooltip"
    >
      <div className={styles.tooltipHeader}>
        <span className={styles.stepIndicator}>
          {currentIndex + 1} / {totalSteps}
        </span>
      </div>

      <div className={styles.tooltipContent} aria-live="polite" aria-atomic="true">
        <h3 id="tour-step-title" className={styles.tooltipTitle}>
          {step.title}
        </h3>
        <p id="tour-step-description" className={styles.tooltipDescription}>
          {step.description}
        </p>
      </div>

      <div className={styles.tooltipFooter}>
        <div className={styles.navigation}>
          <button
            className={styles.navButton}
            onClick={onPrev}
            disabled={isFirstStep}
            aria-label="이전 단계"
          >
            이전
          </button>

          <div className={styles.stepDots}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                data-testid={`step-indicator-${index}`}
                data-active={index === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>

          <button
            className={`${styles.navButton} ${styles.primaryButton}`}
            onClick={isLastStep ? onComplete : onNext}
            aria-label={isLastStep ? '투어 완료' : '다음 단계'}
          >
            {isLastStep ? '완료' : '다음'}
          </button>
        </div>

        <button
          className={styles.skipButton}
          onClick={onSkip}
          aria-label="투어 건너뛰기"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
