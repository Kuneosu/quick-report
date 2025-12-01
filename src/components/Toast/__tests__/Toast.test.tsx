import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from '../Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('렌더링', () => {
    it('메시지가 표시된다', () => {
      render(<Toast message="복사되었습니다" type="success" onClose={() => {}} />);
      expect(screen.getByText('복사되었습니다')).toBeInTheDocument();
    });

    it('success 타입일 때 성공 스타일이 적용된다', () => {
      render(<Toast message="성공" type="success" onClose={() => {}} />);
      expect(screen.getByRole('alert')).toHaveClass(/success/i);
    });

    it('error 타입일 때 에러 스타일이 적용된다', () => {
      render(<Toast message="실패" type="error" onClose={() => {}} />);
      expect(screen.getByRole('alert')).toHaveClass(/error/i);
    });

    it('info 타입일 때 정보 스타일이 적용된다', () => {
      render(<Toast message="정보" type="info" onClose={() => {}} />);
      expect(screen.getByRole('alert')).toHaveClass(/info/i);
    });
  });

  describe('자동 닫힘', () => {
    it('3초 후 onClose가 호출된다', () => {
      const handleClose = vi.fn();
      render(<Toast message="테스트" type="success" onClose={handleClose} />);

      expect(handleClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(3000);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('duration prop으로 시간 조절 가능', () => {
      const handleClose = vi.fn();
      render(<Toast message="테스트" type="success" onClose={handleClose} duration={5000} />);

      vi.advanceTimersByTime(3000);
      expect(handleClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(2000);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('접근성', () => {
    it('role="alert"가 설정되어 있다', () => {
      render(<Toast message="테스트" type="success" onClose={() => {}} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
