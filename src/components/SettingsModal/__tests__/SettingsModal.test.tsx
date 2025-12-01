import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsModal } from '../SettingsModal';
import { DEFAULT_PRESET, BUILT_IN_PRESETS } from '../../../types/preset';

describe('SettingsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentPreset: DEFAULT_PRESET,
    presets: BUILT_IN_PRESETS,
    onSelectPreset: vi.fn(),
    onUpdateLevel: vi.fn(),
    onSavePreset: vi.fn(),
    onDeletePreset: vi.fn(),
    onResetToDefault: vi.fn(),
    onExportPreset: vi.fn().mockReturnValue('{}'),
    onImportPreset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('isOpen=true일 때 모달이 렌더링된다', () => {
      render(<SettingsModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('isOpen=false일 때 모달이 렌더링되지 않는다', () => {
      render(<SettingsModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('제목이 표시된다', () => {
      render(<SettingsModal {...defaultProps} />);
      expect(screen.getByText('형식 설정')).toBeInTheDocument();
    });
  });

  describe('프리셋 선택', () => {
    it('프리셋 목록이 표시된다', () => {
      render(<SettingsModal {...defaultProps} />);
      expect(screen.getByTestId('preset-default')).toBeInTheDocument();
      expect(screen.getByTestId('preset-numbered')).toBeInTheDocument();
    });

    it('프리셋 클릭 시 onSelectPreset이 호출된다', async () => {
      const user = userEvent.setup();
      render(<SettingsModal {...defaultProps} />);

      await user.click(screen.getByTestId('preset-numbered'));
      expect(defaultProps.onSelectPreset).toHaveBeenCalledWith('numbered');
    });
  });

  describe('레벨 설정', () => {
    it('레벨별 입력 필드가 표시된다', () => {
      render(<SettingsModal {...defaultProps} />);
      expect(screen.getByTestId('prefix-1')).toBeInTheDocument();
      expect(screen.getByTestId('indent-1')).toBeInTheDocument();
    });

    it('접두사 변경 시 onUpdateLevel이 호출된다', async () => {
      const user = userEvent.setup();
      render(<SettingsModal {...defaultProps} />);

      const prefixInput = screen.getByTestId('prefix-1');
      await user.clear(prefixInput);
      await user.type(prefixInput, '★');

      expect(defaultProps.onUpdateLevel).toHaveBeenCalled();
    });

    it('들여쓰기 변경 시 onUpdateLevel이 호출된다', async () => {
      const user = userEvent.setup();
      render(<SettingsModal {...defaultProps} />);

      const indentInput = screen.getByTestId('indent-2');
      await user.clear(indentInput);
      await user.type(indentInput, '4');

      expect(defaultProps.onUpdateLevel).toHaveBeenCalled();
    });
  });

  describe('프리셋 저장', () => {
    it('저장 버튼 클릭 시 이름 입력 필드가 표시된다', async () => {
      const user = userEvent.setup();
      render(<SettingsModal {...defaultProps} />);

      await user.click(screen.getByTestId('save-preset-button'));
      expect(screen.getByTestId('preset-name-input')).toBeInTheDocument();
    });

    it('이름 입력 후 저장 시 onSavePreset이 호출된다', async () => {
      const user = userEvent.setup();
      render(<SettingsModal {...defaultProps} />);

      await user.click(screen.getByTestId('save-preset-button'));
      await user.type(screen.getByTestId('preset-name-input'), '나의 프리셋');
      await user.click(screen.getByText('저장'));

      expect(defaultProps.onSavePreset).toHaveBeenCalledWith('나의 프리셋');
    });
  });

  describe('Export/Import', () => {
    it('내보내기 버튼이 표시된다', () => {
      render(<SettingsModal {...defaultProps} />);
      expect(screen.getByTestId('export-button')).toBeInTheDocument();
    });

    it('가져오기 버튼이 표시된다', () => {
      render(<SettingsModal {...defaultProps} />);
      expect(screen.getByTestId('import-button')).toBeInTheDocument();
    });
  });

  describe('모달 닫기', () => {
    it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      render(<SettingsModal {...defaultProps} />);

      await user.click(screen.getByLabelText('닫기'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('완료 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      render(<SettingsModal {...defaultProps} />);

      await user.click(screen.getByText('완료'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('백드롭 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      render(<SettingsModal {...defaultProps} />);

      await user.click(screen.getByTestId('settings-backdrop'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('초기화', () => {
    it('초기화 버튼 클릭 시 onResetToDefault가 호출된다', async () => {
      const user = userEvent.setup();
      render(<SettingsModal {...defaultProps} />);

      await user.click(screen.getByText('초기화'));
      expect(defaultProps.onResetToDefault).toHaveBeenCalled();
    });
  });
});
