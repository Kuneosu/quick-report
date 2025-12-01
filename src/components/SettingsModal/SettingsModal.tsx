import { useState, useEffect, useCallback, useRef } from 'react';
import type { Preset, LevelConfig } from '../../types/preset';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: Preset;
  presets: Preset[];
  onSelectPreset: (id: string) => void;
  onUpdateLevel: (level: 1 | 2 | 3 | 4, config: Partial<Omit<LevelConfig, 'level'>>) => void;
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  onResetToDefault: () => void;
  onExportPreset: (id: string) => string;
  onImportPreset: (json: string) => void;
}

const LEVEL_LABELS = ['H1 (#)', 'H2 (##)', 'H3 (###)', 'H4 (####)'];

export function SettingsModal({
  isOpen,
  onClose,
  currentPreset,
  presets,
  onSelectPreset,
  onUpdateLevel,
  onSavePreset,
  onDeletePreset,
  onResetToDefault,
  onExportPreset,
  onImportPreset,
}: SettingsModalProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ESC 키 핸들러
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSaveClick = () => {
    if (showSaveDialog && presetName.trim()) {
      onSavePreset(presetName.trim());
      setPresetName('');
      setShowSaveDialog(false);
    } else {
      setShowSaveDialog(true);
    }
  };

  const handleExport = () => {
    const json = onExportPreset(currentPreset.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPreset.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          onImportPreset(json);
        } catch {
          alert('잘못된 파일 형식입니다.');
        }
      };
      reader.readAsText(file);
    }
    // 같은 파일 다시 선택 가능하도록 초기화
    e.target.value = '';
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 프리셋을 삭제하시겠습니까?')) {
      onDeletePreset(id);
    }
  };

  const getPreviewText = (level: LevelConfig): string => {
    return `${' '.repeat(level.indent)}${level.prefix} 예시`;
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      data-testid="settings-backdrop"
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <header className={styles.header}>
          <h2 id="settings-title" className={styles.title}>
            형식 설정
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </header>

        <div className={styles.content}>
          {/* 프리셋 선택 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>프리셋</h3>
            <div className={styles.presetSelector}>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  className={`${styles.presetButton} ${
                    preset.id === currentPreset.id ? styles.active : ''
                  } ${!preset.isBuiltIn ? styles.deletable : ''}`}
                  onClick={() => onSelectPreset(preset.id)}
                  data-testid={`preset-${preset.id}`}
                >
                  {preset.name}
                  {!preset.isBuiltIn && (
                    <span
                      className={styles.deleteIcon}
                      onClick={(e) => handleDeletePreset(preset.id, e)}
                      role="button"
                      aria-label={`${preset.name} 삭제`}
                    >
                      ✕
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 레벨별 설정 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>레벨 설정</h3>
            <div className={styles.levelConfig}>
              {currentPreset.levels.map((level, index) => (
                <div key={level.level} className={styles.levelRow}>
                  <span className={styles.levelLabel}>{LEVEL_LABELS[index]}</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={level.prefix}
                    onChange={(e) =>
                      onUpdateLevel(level.level, { prefix: e.target.value })
                    }
                    placeholder="접두사"
                    aria-label={`${LEVEL_LABELS[index]} 접두사`}
                    data-testid={`prefix-${level.level}`}
                  />
                  <input
                    type="number"
                    className={styles.input}
                    value={level.indent}
                    onChange={(e) =>
                      onUpdateLevel(level.level, { indent: parseInt(e.target.value) || 0 })
                    }
                    min={0}
                    max={20}
                    placeholder="들여쓰기"
                    aria-label={`${LEVEL_LABELS[index]} 들여쓰기`}
                    data-testid={`indent-${level.level}`}
                  />
                  <span className={styles.preview}>{getPreviewText(level)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 저장 다이얼로그 */}
          {showSaveDialog && (
            <div className={styles.saveDialog}>
              <input
                type="text"
                className={styles.saveInput}
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="프리셋 이름 입력"
                aria-label="새 프리셋 이름"
                data-testid="preset-name-input"
                autoFocus
              />
              <button
                className={`${styles.actionButton} ${styles.primary}`}
                onClick={handleSaveClick}
                disabled={!presetName.trim()}
              >
                저장
              </button>
              <button
                className={styles.actionButton}
                onClick={() => setShowSaveDialog(false)}
              >
                취소
              </button>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={handleSaveClick}
              data-testid="save-preset-button"
            >
              프리셋으로 저장
            </button>
            <button
              className={styles.actionButton}
              onClick={handleExport}
              data-testid="export-button"
            >
              내보내기
            </button>
            <button
              className={styles.actionButton}
              onClick={handleImportClick}
              data-testid="import-button"
            >
              가져오기
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className={styles.hiddenInput}
              onChange={handleFileChange}
              data-testid="import-input"
            />
          </div>
        </div>

        <footer className={styles.footer}>
          <button
            className={`${styles.footerButton} ${styles.secondary}`}
            onClick={onResetToDefault}
          >
            초기화
          </button>
          <button
            className={`${styles.footerButton} ${styles.primary}`}
            onClick={onClose}
          >
            완료
          </button>
        </footer>
      </div>
    </div>
  );
}
