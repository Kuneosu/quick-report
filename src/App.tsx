import { useState, useEffect, useCallback } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { CopyButton } from './components/CopyButton';
import { Toast } from './components/Toast';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { GuideModal } from './components/GuideModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { NameInputDialog } from './components/NameInputDialog';
import { MobileTabBar } from './components/MobileTabBar';
import { SettingsModal } from './components/SettingsModal';
import { Sidebar } from './components/Sidebar';
import { ProductTour, TOUR_STORAGE_KEY } from './components/ProductTour';
import { ImportModal } from './components/ImportModal';
import type { TabType } from './components/MobileTabBar';
import { convertWithConfig } from './utils/markdownConverter';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDebounce } from './hooks/useDebounce';
import { useTheme } from './hooks/useTheme';
import { useMediaQuery } from './hooks/useMediaQuery';
import { usePreset } from './hooks/usePreset';
import { useDocuments } from './hooks/useDocuments';
import './styles/global.css';
import styles from './App.module.css';

const STORAGE_KEY = 'md-to-report-content';
const SIDEBAR_KEY = 'md-to-report-sidebar-open';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [savedContent, setSavedContent] = useLocalStorage<string>(STORAGE_KEY, '');
  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorage<boolean>(SIDEBAR_KEY, true);
  const [markdown, setMarkdown] = useState(savedContent);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [pendingLoadDocId, setPendingLoadDocId] = useState<string | null>(null);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [currentDocumentId, setCurrentDocumentId] = useState<string | undefined>(undefined);
  const [isTourActive, setIsTourActive] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // 프리셋 관리
  const {
    currentPreset,
    presets,
    selectPreset,
    updateLevel,
    saveAsPreset,
    deletePreset,
    resetToDefault,
    exportPreset,
    importPreset,
  } = usePreset();

  // 문서 관리
  const {
    documents,
    saveDocument,
    getDocument,
    deleteDocument,
    updateDocument,
  } = useDocuments();

  // 반응형 체크
  const isMobile = useMediaQuery('(max-width: 767px)');

  // 디바운싱된 마크다운 (자동 저장용)
  const debouncedMarkdown = useDebounce(markdown, 200);

  // 변환 결과 (현재 프리셋 설정 사용)
  const convertedContent = convertWithConfig(markdown, currentPreset.levels);

  // 자동 저장
  useEffect(() => {
    if (debouncedMarkdown !== savedContent) {
      setSavedContent(debouncedMarkdown);
      setSavedAt(new Date());
    }
  }, [debouncedMarkdown, savedContent, setSavedContent]);

  // 복사 성공 핸들러
  const handleCopySuccess = useCallback(() => {
    setToast({ message: '클립보드에 복사되었습니다', type: 'success' });
  }, []);

  // 복사 실패 핸들러
  const handleCopyError = useCallback(() => {
    setToast({ message: '복사에 실패했습니다', type: 'error' });
  }, []);

  // 토스트 닫기
  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  // 가이드 모달 열기
  const handleOpenGuide = useCallback(() => {
    setIsGuideOpen(true);
  }, []);

  // 가이드 모달 닫기
  const handleCloseGuide = useCallback(() => {
    setIsGuideOpen(false);
  }, []);

  // 설정 모달 열기
  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  // 설정 모달 닫기
  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  // Import 모달 열기
  const handleOpenImport = useCallback(() => {
    setIsImportOpen(true);
  }, []);

  // Import 모달 닫기
  const handleCloseImport = useCallback(() => {
    setIsImportOpen(false);
  }, []);

  // Import 내용 적용
  const handleApplyImport = useCallback((text: string, mode: 'overwrite' | 'append' | 'prepend') => {
    if (mode === 'overwrite') {
      setMarkdown(text);
      setSavedContent(text);
    } else if (mode === 'append') {
      const newContent = markdown.trim() ? markdown + '\n\n' + text : text;
      setMarkdown(newContent);
      setSavedContent(newContent);
    } else if (mode === 'prepend') {
      const newContent = markdown.trim() ? text + '\n\n' + markdown : text;
      setMarkdown(newContent);
      setSavedContent(newContent);
    }
    setSavedAt(new Date());
    setToast({ message: '불러오기가 완료되었습니다', type: 'success' });
  }, [markdown, setSavedContent]);

  // 새로 작성 다이얼로그 열기
  const handleOpenConfirm = useCallback(() => {
    if (markdown.trim()) {
      setIsConfirmOpen(true);
    }
  }, [markdown]);

  // 새로 작성 다이얼로그 닫기
  const handleCloseConfirm = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  // 내용 초기화 확인
  const handleConfirmClear = useCallback(() => {
    setMarkdown('');
    setSavedContent('');
    setSavedAt(null);
    setIsConfirmOpen(false);
    setToast({ message: '내용이 초기화되었습니다', type: 'info' });
  }, [setSavedContent]);

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // 사이드바 토글
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, [setIsSidebarOpen]);

  // 문서 선택
  const handleSelectDocument = useCallback(
    (id: string) => {
      const doc = getDocument(id);
      if (doc) {
        // 에디터가 비어있으면 바로 불러오기
        if (!markdown.trim()) {
          setMarkdown(doc.content);
          setCurrentDocumentId(id);
          setSavedContent(doc.content);
          // 모바일에서 사이드바 닫기
          if (isMobile) {
            setIsSidebarOpen(false);
          }
        } else {
          // 내용이 있으면 선택 다이얼로그 표시
          setPendingLoadDocId(id);
          setIsLoadDialogOpen(true);
        }
      }
    },
    [getDocument, setSavedContent, isMobile, setIsSidebarOpen, markdown]
  );

  // 문서 불러오기 - 덮어쓰기
  const handleLoadOverwrite = useCallback(() => {
    if (pendingLoadDocId) {
      const doc = getDocument(pendingLoadDocId);
      if (doc) {
        setMarkdown(doc.content);
        setCurrentDocumentId(pendingLoadDocId);
        setSavedContent(doc.content);
        if (isMobile) {
          setIsSidebarOpen(false);
        }
      }
    }
    setIsLoadDialogOpen(false);
    setPendingLoadDocId(null);
  }, [pendingLoadDocId, getDocument, setSavedContent, isMobile, setIsSidebarOpen]);

  // 문서 불러오기 - 뒤에 추가
  const handleLoadAppend = useCallback(() => {
    if (pendingLoadDocId) {
      const doc = getDocument(pendingLoadDocId);
      if (doc) {
        setMarkdown((prev) => prev + '\n\n' + doc.content);
        setCurrentDocumentId(pendingLoadDocId);
        setSavedContent((prev) => prev + '\n\n' + doc.content);
        if (isMobile) {
          setIsSidebarOpen(false);
        }
      }
    }
    setIsLoadDialogOpen(false);
    setPendingLoadDocId(null);
  }, [pendingLoadDocId, getDocument, setSavedContent, isMobile, setIsSidebarOpen]);

  // 문서 불러오기 취소
  const handleLoadCancel = useCallback(() => {
    setIsLoadDialogOpen(false);
    setPendingLoadDocId(null);
  }, []);

  // 문서 저장 다이얼로그 열기
  const handleOpenSaveDialog = useCallback(() => {
    if (!markdown.trim()) {
      setToast({ message: '저장할 내용이 없습니다', type: 'error' });
      return;
    }
    setIsNameDialogOpen(true);
  }, [markdown]);

  // 문서 저장 (이름 입력 후)
  const handleSaveWithName = useCallback((name: string) => {
    const doc = saveDocument({ content: markdown, name: name || undefined });
    setCurrentDocumentId(doc.id);
    setToast({ message: '문서가 저장되었습니다', type: 'success' });
    setIsNameDialogOpen(false);
  }, [markdown, saveDocument]);

  // 문서 저장 취소
  const handleCancelSave = useCallback(() => {
    setIsNameDialogOpen(false);
  }, []);

  // 문서 삭제
  const handleDeleteDocument = useCallback(
    (id: string) => {
      deleteDocument(id);
      if (id === currentDocumentId) {
        setCurrentDocumentId(undefined);
      }
      setToast({ message: '문서가 삭제되었습니다', type: 'info' });
    },
    [deleteDocument, currentDocumentId]
  );

  // 문서 이름 변경
  const handleRenameDocument = useCallback(
    (id: string, newName: string) => {
      updateDocument(id, { name: newName });
      setToast({ message: '문서 이름이 변경되었습니다', type: 'success' });
    },
    [updateDocument]
  );

  // 모바일에서 섹션 표시 여부
  const showEditor = !isMobile || activeTab === 'editor';
  const showPreview = !isMobile || activeTab === 'preview';

  // 첫 방문 시 투어 자동 시작
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => {
        setIsTourActive(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // 투어 시작 (가이드 모달에서)
  const handleStartTour = useCallback(() => {
    setIsGuideOpen(false);
    setIsTourActive(true);
  }, []);

  // 투어 완료
  const handleTourComplete = useCallback(() => {
    setIsTourActive(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setToast({ message: '투어를 완료했습니다! 언제든 가이드에서 다시 볼 수 있어요.', type: 'success' });
  }, []);

  // 투어 건너뛰기
  const handleTourSkip = useCallback(() => {
    setIsTourActive(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setToast({ message: '언제든 가이드에서 투어를 다시 시작할 수 있어요.', type: 'info' });
  }, []);

  return (
    <div className={styles.app}>
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenGuide={handleOpenGuide}
        onOpenSettings={handleOpenSettings}
        onOpenImport={handleOpenImport}
      />

      {isMobile && (
        <MobileTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      <div className={styles.body}>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          documents={documents}
          currentDocumentId={currentDocumentId}
          onSelectDocument={handleSelectDocument}
          onDeleteDocument={handleDeleteDocument}
          onSaveDocument={handleOpenSaveDialog}
          onRenameDocument={handleRenameDocument}
          isMobile={isMobile}
        />

        <main className={`${styles.main} ${isMobile ? styles.mobile : ''}`}>
          {showEditor && (
            <section
              className={styles.editorSection}
              id="editor-panel"
              role="tabpanel"
              aria-labelledby={isMobile ? 'editor-tab' : undefined}
            >
              {!isMobile && <h2 className={styles.sectionTitle}>마크다운 입력</h2>}
              <Editor value={markdown} onChange={setMarkdown} />
            </section>
          )}

          {showPreview && (
            <section
              className={styles.previewSection}
              id="preview-panel"
              role="tabpanel"
              aria-labelledby={isMobile ? 'preview-tab' : undefined}
            >
              {!isMobile && <h2 className={styles.sectionTitle}>변환 결과</h2>}
              <div className={styles.copyButtonWrapper}>
                <CopyButton
                  text={convertedContent}
                  onCopySuccess={handleCopySuccess}
                  onCopyError={handleCopyError}
                  disabled={!convertedContent.trim()}
                />
              </div>
              <Preview content={convertedContent} />
            </section>
          )}
        </main>
      </div>

      <Footer savedAt={savedAt} onClear={handleOpenConfirm} />

      <GuideModal isOpen={isGuideOpen} onClose={handleCloseGuide} onStartTour={handleStartTour} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        currentPreset={currentPreset}
        presets={presets}
        onSelectPreset={selectPreset}
        onUpdateLevel={updateLevel}
        onSavePreset={saveAsPreset}
        onDeletePreset={deletePreset}
        onResetToDefault={resetToDefault}
        onExportPreset={exportPreset}
        onImportPreset={importPreset}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={handleCloseImport}
        onApply={handleApplyImport}
        hasExistingContent={!!markdown.trim()}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="새로 작성"
        message="현재 작성 중인 내용이 모두 삭제됩니다. 계속하시겠습니까?"
        onConfirm={handleConfirmClear}
        onCancel={handleCloseConfirm}
      />

      <ConfirmDialog
        isOpen={isLoadDialogOpen}
        title="문서 불러오기"
        message={`"${pendingLoadDocId ? getDocument(pendingLoadDocId)?.name || '' : ''}"을(를) 불러옵니다. 현재 작성 중인 내용을 어떻게 할까요?`}
        onConfirm={handleLoadOverwrite}
        onCancel={handleLoadCancel}
        confirmText="덮어쓰기"
        confirmVariant="primary"
        thirdAction={{
          text: '뒤에 추가',
          onClick: handleLoadAppend,
          variant: 'secondary',
        }}
      />

      <NameInputDialog
        isOpen={isNameDialogOpen}
        onSave={handleSaveWithName}
        onCancel={handleCancelSave}
      />

      {toast && (
        <div className={styles.toastContainer}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={handleCloseToast}
          />
        </div>
      )}

      <ProductTour
        isActive={isTourActive}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />
    </div>
  );
}

export default App;
