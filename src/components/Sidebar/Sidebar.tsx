import { useState, useCallback, useRef, useEffect } from 'react';
import type { Document } from '../../types/document';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  documents: Document[];
  currentDocumentId?: string;
  onSelectDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onSaveDocument: () => void;
  onRenameDocument?: (id: string, newName: string) => void;
  isMobile?: boolean;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

export function Sidebar({
  isOpen,
  onToggle,
  documents,
  currentDocumentId,
  onSelectDocument,
  onDeleteDocument,
  onSaveDocument,
  onRenameDocument,
  isMobile = false,
}: SidebarProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // 편집 모드 시작 시 input 포커스
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleDeleteClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  }, []);

  const handleConfirmDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteDocument(id);
      setDeleteConfirmId(null);
    },
    [onDeleteDocument]
  );

  const handleCancelDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  }, []);

  // 이름 편집 시작
  const handleNameClick = useCallback((doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRenameDocument) {
      setEditingId(doc.id);
      setEditingName(doc.name);
    }
  }, [onRenameDocument]);

  // 이름 편집 확정
  const handleNameConfirm = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editingName.trim() && onRenameDocument) {
      onRenameDocument(id, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  }, [editingName, onRenameDocument]);

  // 이름 편집 취소
  const handleNameCancel = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditingName('');
  }, []);

  // 키보드 이벤트 핸들러
  const handleNameKeyDown = useCallback((id: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameConfirm(id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleNameCancel();
    }
  }, [handleNameConfirm, handleNameCancel]);

  return (
    <>
      {/* 모바일 오버레이 */}
      {isMobile && isOpen && (
        <div
          className={styles.overlay}
          onClick={onToggle}
          data-testid="sidebar-overlay"
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''}`}
        data-testid="sidebar"
      >
        {/* 접힌 상태: 토글 버튼만 표시 */}
        {!isOpen && !isMobile && (
          <div className={styles.collapsedContent}>
            <button
              className={styles.collapsedToggle}
              onClick={onToggle}
              aria-label="사이드바 열기"
              data-testid="sidebar-open-button"
            >
              ☰
            </button>
          </div>
        )}

        {/* 열린 상태: 전체 컨텐츠 */}
        {(isOpen || isMobile) && (
          <>
            <header className={styles.header}>
              <h2 className={styles.title}>문서 목록</h2>
              <button
                className={styles.toggleButton}
                onClick={onToggle}
                aria-label="사이드바 닫기"
                data-testid="sidebar-close-button"
              >
                ✕
              </button>
            </header>

            <div className={styles.content}>
              {documents.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📄</span>
                  <span className={styles.emptyText}>
                    저장된 문서가 없습니다
                  </span>
                </div>
              ) : (
                <div className={styles.documentList}>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`${styles.documentItem} ${
                        doc.id === currentDocumentId ? styles.active : ''
                      }`}
                      onClick={() => editingId !== doc.id && onSelectDocument(doc.id)}
                      data-testid={`document-${doc.id}`}
                    >
                      <div className={styles.documentInfo}>
                        {editingId === doc.id ? (
                          <div className={styles.editNameContainer}>
                            <input
                              ref={editInputRef}
                              type="text"
                              className={styles.editNameInput}
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => handleNameKeyDown(doc.id, e)}
                              onBlur={() => handleNameCancel()}
                              onClick={(e) => e.stopPropagation()}
                              aria-label="문서 이름 편집"
                              data-testid={`edit-name-${doc.id}`}
                            />
                            <button
                              className={styles.editButton}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleNameConfirm(doc.id, e);
                              }}
                              aria-label="편집 확정"
                            >
                              ✓
                            </button>
                            <button
                              className={styles.editButton}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleNameCancel(e);
                              }}
                              aria-label="편집 취소"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`${styles.documentName} ${onRenameDocument ? styles.editable : ''}`}
                            onClick={(e) => handleNameClick(doc, e)}
                            title={onRenameDocument ? '클릭하여 이름 편집' : undefined}
                          >
                            {doc.name}
                          </div>
                        )}
                        <div className={styles.documentDate}>
                          {formatDate(doc.updatedAt)}
                        </div>
                      </div>
                      {deleteConfirmId === doc.id ? (
                        <>
                          <button
                            className={styles.deleteButton}
                            onClick={(e) => handleConfirmDelete(doc.id, e)}
                            style={{ opacity: 1, color: 'var(--color-error)' }}
                            aria-label="삭제 확인"
                          >
                            ✓
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={handleCancelDelete}
                            style={{ opacity: 1 }}
                            aria-label="삭제 취소"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <button
                          className={styles.deleteButton}
                          onClick={(e) => handleDeleteClick(doc.id, e)}
                          aria-label={`${doc.name} 삭제`}
                          data-testid={`delete-${doc.id}`}
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <footer className={styles.footer}>
              <button
                className={styles.saveButton}
                onClick={onSaveDocument}
                data-testid="save-document-button"
              >
                + 새 문서 저장
              </button>
            </footer>
          </>
        )}
      </aside>

      {/* 모바일에서 외부 토글 버튼 (사이드바 닫혔을 때) */}
      {!isOpen && isMobile && (
        <button
          className={styles.externalToggle}
          onClick={onToggle}
          aria-label="사이드바 열기"
          data-testid="sidebar-open-button"
        >
          ☰
        </button>
      )}
    </>
  );
}
