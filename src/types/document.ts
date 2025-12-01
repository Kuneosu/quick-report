/**
 * 저장된 문서 타입
 */
export interface Document {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 문서 생성 시 필요한 데이터
 */
export interface CreateDocumentInput {
  name?: string;
  content: string;
}
