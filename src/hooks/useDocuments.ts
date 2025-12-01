import { useState, useCallback } from 'react';
import type { Document, CreateDocumentInput } from '../types/document';

const STORAGE_KEY = 'md-to-report-documents';

function generateId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateDefaultName(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return `문서 ${month}/${day} ${hours}:${String(minutes).padStart(2, '0')}`;
}

function loadDocuments(): Document[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Document[];
    }
  } catch {
    // 무시
  }
  return [];
}

function saveDocumentsToStorage(documents: Document[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
}

interface UseDocumentsReturn {
  documents: Document[];
  saveDocument: (input: CreateDocumentInput) => Document;
  getDocument: (id: string) => Document | undefined;
  deleteDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>) => void;
}

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>(() => loadDocuments());

  const saveDocument = useCallback((input: CreateDocumentInput): Document => {
    const now = new Date().toISOString();
    const newDoc: Document = {
      id: generateId(),
      name: input.name || generateDefaultName(),
      content: input.content,
      createdAt: now,
      updatedAt: now,
    };

    setDocuments((prev) => {
      const updated = [newDoc, ...prev];
      saveDocumentsToStorage(updated);
      return updated;
    });

    return newDoc;
  }, []);

  const getDocument = useCallback(
    (id: string): Document | undefined => {
      return documents.find((doc) => doc.id === id);
    },
    [documents]
  );

  const deleteDocument = useCallback((id: string): void => {
    setDocuments((prev) => {
      const updated = prev.filter((doc) => doc.id !== id);
      saveDocumentsToStorage(updated);
      return updated;
    });
  }, []);

  const updateDocument = useCallback(
    (id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>): void => {
      setDocuments((prev) => {
        const updated = prev.map((doc) =>
          doc.id === id
            ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
            : doc
        );
        saveDocumentsToStorage(updated);
        return updated;
      });
    },
    []
  );

  return {
    documents,
    saveDocument,
    getDocument,
    deleteDocument,
    updateDocument,
  };
}
