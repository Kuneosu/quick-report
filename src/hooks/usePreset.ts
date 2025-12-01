import { useState, useCallback } from 'react';
import type { Preset, LevelConfig } from '../types/preset';
import { DEFAULT_PRESET, BUILT_IN_PRESETS } from '../types/preset';

const PRESETS_STORAGE_KEY = 'md-to-report-presets';
const CURRENT_PRESET_KEY = 'md-to-report-current-preset';

interface UsePresetReturn {
  currentPreset: Preset;
  presets: Preset[];
  selectPreset: (id: string) => void;
  updateLevel: (level: 1 | 2 | 3 | 4, config: Partial<Omit<LevelConfig, 'level'>>) => void;
  saveAsPreset: (name: string) => void;
  deletePreset: (id: string) => void;
  resetToDefault: () => void;
  exportPreset: (id: string) => string;
  importPreset: (json: string) => void;
}

function generateId(): string {
  return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadUserPresets(): Preset[] {
  try {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Preset[];
    }
  } catch {
    // 무시
  }
  return [];
}

function saveUserPresets(presets: Preset[]): void {
  const userPresets = presets.filter((p) => !p.isBuiltIn);
  localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(userPresets));
}

function loadCurrentPresetId(): string {
  try {
    return localStorage.getItem(CURRENT_PRESET_KEY) || 'default';
  } catch {
    return 'default';
  }
}

function saveCurrentPresetId(id: string): void {
  localStorage.setItem(CURRENT_PRESET_KEY, id);
}

export function usePreset(): UsePresetReturn {
  const [presets, setPresets] = useState<Preset[]>(() => {
    const userPresets = loadUserPresets();
    return [...BUILT_IN_PRESETS, ...userPresets];
  });

  const [currentPresetId, setCurrentPresetId] = useState<string>(() => loadCurrentPresetId());

  const [editingLevels, setEditingLevels] = useState<LevelConfig[] | null>(null);

  const currentPreset: Preset = (() => {
    const preset = presets.find((p) => p.id === currentPresetId) || DEFAULT_PRESET;
    if (editingLevels) {
      return { ...preset, levels: editingLevels };
    }
    return preset;
  })();

  const selectPreset = useCallback((id: string) => {
    setPresets((current) => {
      const exists = current.find((p) => p.id === id);
      if (exists) {
        setCurrentPresetId(id);
        saveCurrentPresetId(id);
        setEditingLevels(null);
      }
      return current;
    });
  }, []);

  const updateLevel = useCallback(
    (level: 1 | 2 | 3 | 4, config: Partial<Omit<LevelConfig, 'level'>>) => {
      setEditingLevels((prev) => {
        const baseLevels = prev || currentPreset.levels;
        return baseLevels.map((l) =>
          l.level === level ? { ...l, ...config } : l
        );
      });
    },
    [currentPreset.levels]
  );

  const saveAsPreset = useCallback(
    (name: string) => {
      const newPreset: Preset = {
        id: generateId(),
        name,
        levels: editingLevels || currentPreset.levels,
        isBuiltIn: false,
      };

      setPresets((prev) => {
        const updated = [...prev, newPreset];
        saveUserPresets(updated);
        return updated;
      });

      setCurrentPresetId(newPreset.id);
      saveCurrentPresetId(newPreset.id);
      setEditingLevels(null);
    },
    [currentPreset.levels, editingLevels]
  );

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => {
      const preset = prev.find((p) => p.id === id);
      if (preset?.isBuiltIn) {
        return prev;
      }

      const updated = prev.filter((p) => p.id !== id);
      saveUserPresets(updated);

      // 삭제한 프리셋이 현재 선택된 것이면 기본으로 변경
      if (id === currentPresetId) {
        setCurrentPresetId('default');
        saveCurrentPresetId('default');
        setEditingLevels(null);
      }

      return updated;
    });
  }, [currentPresetId]);

  const resetToDefault = useCallback(() => {
    setEditingLevels(null);
    setCurrentPresetId('default');
    saveCurrentPresetId('default');
  }, []);

  const exportPreset = useCallback(
    (id: string): string => {
      const preset = presets.find((p) => p.id === id) || currentPreset;
      const exportData = {
        name: preset.name,
        levels: editingLevels || preset.levels,
      };
      return JSON.stringify(exportData, null, 2);
    },
    [presets, currentPreset, editingLevels]
  );

  const importPreset = useCallback((json: string) => {
    const parsed = JSON.parse(json);

    if (!parsed.name || !Array.isArray(parsed.levels) || parsed.levels.length !== 4) {
      throw new Error('Invalid preset format');
    }

    const newPreset: Preset = {
      id: generateId(),
      name: parsed.name,
      levels: parsed.levels,
      isBuiltIn: false,
    };

    setPresets((prev) => {
      const updated = [...prev, newPreset];
      saveUserPresets(updated);
      return updated;
    });

    setCurrentPresetId(newPreset.id);
    saveCurrentPresetId(newPreset.id);
    setEditingLevels(null);
  }, []);

  return {
    currentPreset,
    presets,
    selectPreset,
    updateLevel,
    saveAsPreset,
    deletePreset,
    resetToDefault,
    exportPreset,
    importPreset,
  };
}
