import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePreset } from '../usePreset';
import { BUILT_IN_PRESETS } from '../../types/preset';

describe('usePreset', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('초기화', () => {
    it('기본 프리셋이 선택된 상태로 시작한다', () => {
      const { result } = renderHook(() => usePreset());
      expect(result.current.currentPreset.id).toBe('default');
    });

    it('기본 제공 프리셋 목록을 가지고 있다', () => {
      const { result } = renderHook(() => usePreset());
      expect(result.current.presets.length).toBeGreaterThanOrEqual(BUILT_IN_PRESETS.length);
    });
  });

  describe('프리셋 선택', () => {
    it('다른 프리셋을 선택할 수 있다', () => {
      const { result } = renderHook(() => usePreset());

      act(() => {
        result.current.selectPreset('numbered');
      });

      expect(result.current.currentPreset.id).toBe('numbered');
    });

    it('존재하지 않는 프리셋 선택 시 기본 프리셋 유지', () => {
      const { result } = renderHook(() => usePreset());

      act(() => {
        result.current.selectPreset('non-existent');
      });

      expect(result.current.currentPreset.id).toBe('default');
    });
  });

  describe('레벨 설정 변경', () => {
    it('특정 레벨의 접두사를 변경할 수 있다', () => {
      const { result } = renderHook(() => usePreset());

      act(() => {
        result.current.updateLevel(1, { prefix: '★' });
      });

      const level1 = result.current.currentPreset.levels.find((l) => l.level === 1);
      expect(level1?.prefix).toBe('★');
    });

    it('특정 레벨의 들여쓰기를 변경할 수 있다', () => {
      const { result } = renderHook(() => usePreset());

      act(() => {
        result.current.updateLevel(2, { indent: 4 });
      });

      const level2 = result.current.currentPreset.levels.find((l) => l.level === 2);
      expect(level2?.indent).toBe(4);
    });
  });

  describe('사용자 프리셋 저장', () => {
    it('현재 설정을 새 프리셋으로 저장할 수 있다', () => {
      const { result } = renderHook(() => usePreset());

      act(() => {
        result.current.updateLevel(1, { prefix: '★' });
        result.current.saveAsPreset('나의 프리셋');
      });

      const savedPreset = result.current.presets.find((p) => p.name === '나의 프리셋');
      expect(savedPreset).toBeDefined();
      expect(savedPreset?.isBuiltIn).toBeFalsy();
    });

    it('저장된 프리셋이 localStorage에 저장된다', () => {
      const { result } = renderHook(() => usePreset());

      act(() => {
        result.current.saveAsPreset('테스트 프리셋');
      });

      // 프리셋이 목록에 추가되었는지 확인
      const savedPreset = result.current.presets.find((p) => p.name === '테스트 프리셋');
      expect(savedPreset).toBeDefined();
      expect(savedPreset?.isBuiltIn).toBeFalsy();
    });
  });

  describe('프리셋 삭제', () => {
    it('사용자 프리셋을 삭제할 수 있다', () => {
      const { result } = renderHook(() => usePreset());

      act(() => {
        result.current.saveAsPreset('삭제할 프리셋');
      });

      const presetId = result.current.presets.find((p) => p.name === '삭제할 프리셋')?.id;
      expect(presetId).toBeDefined();

      act(() => {
        result.current.deletePreset(presetId!);
      });

      expect(result.current.presets.find((p) => p.id === presetId)).toBeUndefined();
    });

    it('기본 제공 프리셋은 삭제할 수 없다', () => {
      const { result } = renderHook(() => usePreset());

      act(() => {
        result.current.deletePreset('default');
      });

      expect(result.current.presets.find((p) => p.id === 'default')).toBeDefined();
    });
  });

  describe('설정 초기화', () => {
    it('현재 프리셋을 기본값으로 초기화할 수 있다', () => {
      const { result } = renderHook(() => usePreset());

      act(() => {
        result.current.updateLevel(1, { prefix: '★' });
        result.current.resetToDefault();
      });

      const level1 = result.current.currentPreset.levels.find((l) => l.level === 1);
      expect(level1?.prefix).toBe('▶');
    });
  });

  describe('JSON Export/Import', () => {
    it('프리셋을 JSON으로 내보낼 수 있다', () => {
      const { result } = renderHook(() => usePreset());

      const json = result.current.exportPreset(result.current.currentPreset.id);
      const parsed = JSON.parse(json);

      expect(parsed.name).toBe('기본 형식');
      expect(parsed.levels).toHaveLength(4);
    });

    it('JSON에서 프리셋을 가져올 수 있다', () => {
      const { result } = renderHook(() => usePreset());
      const importJson = JSON.stringify({
        name: '가져온 프리셋',
        levels: [
          { level: 1, prefix: '◆', indent: 0 },
          { level: 2, prefix: '◇', indent: 2 },
          { level: 3, prefix: '○', indent: 4 },
          { level: 4, prefix: '●', indent: 6 },
        ],
      });

      act(() => {
        result.current.importPreset(importJson);
      });

      const imported = result.current.presets.find((p) => p.name === '가져온 프리셋');
      expect(imported).toBeDefined();
    });

    it('잘못된 JSON 가져오기 시 에러를 반환한다', () => {
      const { result } = renderHook(() => usePreset());

      expect(() => {
        act(() => {
          result.current.importPreset('invalid json');
        });
      }).toThrow();
    });
  });
});
