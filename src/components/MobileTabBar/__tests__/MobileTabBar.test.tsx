import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileTabBar } from '../MobileTabBar';

describe('MobileTabBar', () => {
  describe('렌더링', () => {
    it('입력 탭이 표시된다', () => {
      render(
        <MobileTabBar
          activeTab="editor"
          onTabChange={() => {}}
        />
      );
      expect(screen.getByRole('tab', { name: /입력/i })).toBeInTheDocument();
    });

    it('결과 탭이 표시된다', () => {
      render(
        <MobileTabBar
          activeTab="editor"
          onTabChange={() => {}}
        />
      );
      expect(screen.getByRole('tab', { name: /결과/i })).toBeInTheDocument();
    });

    it('activeTab이 editor일 때 입력 탭이 활성화된다', () => {
      render(
        <MobileTabBar
          activeTab="editor"
          onTabChange={() => {}}
        />
      );
      expect(screen.getByRole('tab', { name: /입력/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('activeTab이 preview일 때 결과 탭이 활성화된다', () => {
      render(
        <MobileTabBar
          activeTab="preview"
          onTabChange={() => {}}
        />
      );
      expect(screen.getByRole('tab', { name: /결과/i })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('인터랙션', () => {
    it('입력 탭 클릭 시 onTabChange("editor")가 호출된다', async () => {
      const user = userEvent.setup();
      const handleTabChange = vi.fn();
      render(
        <MobileTabBar
          activeTab="preview"
          onTabChange={handleTabChange}
        />
      );

      await user.click(screen.getByRole('tab', { name: /입력/i }));
      expect(handleTabChange).toHaveBeenCalledWith('editor');
    });

    it('결과 탭 클릭 시 onTabChange("preview")가 호출된다', async () => {
      const user = userEvent.setup();
      const handleTabChange = vi.fn();
      render(
        <MobileTabBar
          activeTab="editor"
          onTabChange={handleTabChange}
        />
      );

      await user.click(screen.getByRole('tab', { name: /결과/i }));
      expect(handleTabChange).toHaveBeenCalledWith('preview');
    });
  });

  describe('접근성', () => {
    it('role="tablist"가 설정되어 있다', () => {
      render(
        <MobileTabBar
          activeTab="editor"
          onTabChange={() => {}}
        />
      );
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('각 탭에 role="tab"이 설정되어 있다', () => {
      render(
        <MobileTabBar
          activeTab="editor"
          onTabChange={() => {}}
        />
      );
      expect(screen.getAllByRole('tab')).toHaveLength(2);
    });

    it('키보드 화살표 키로 탭 간 이동 가능하다', async () => {
      const user = userEvent.setup();
      const handleTabChange = vi.fn();
      render(
        <MobileTabBar
          activeTab="editor"
          onTabChange={handleTabChange}
        />
      );

      const editorTab = screen.getByRole('tab', { name: /입력/i });
      editorTab.focus();

      await user.keyboard('{ArrowRight}');
      expect(handleTabChange).toHaveBeenCalledWith('preview');
    });
  });
});
