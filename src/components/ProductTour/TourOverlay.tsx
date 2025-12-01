import { useEffect, useState, useCallback } from 'react';
import styles from './ProductTour.module.css';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourOverlayProps {
  targetSelector: string;
  isVisible: boolean;
}

export function TourOverlay({ targetSelector, isVisible }: TourOverlayProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const updateTargetRect = useCallback(() => {
    const target = document.querySelector(targetSelector);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect(null);
    }
  }, [targetSelector]);

  useEffect(() => {
    if (!isVisible) return;

    updateTargetRect();

    // 리사이즈 및 스크롤 이벤트에 대응
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [isVisible, updateTargetRect]);

  if (!isVisible) return null;

  const padding = 8; // 하이라이트 패딩

  return (
    <div className={styles.overlay} data-testid="tour-overlay">
      {targetRect && (
        <div
          className={styles.spotlight}
          style={{
            top: targetRect.top - padding,
            left: targetRect.left - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
          }}
          data-testid="tour-spotlight"
        />
      )}
    </div>
  );
}
