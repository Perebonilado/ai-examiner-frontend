import { MetaModel } from "./meta.model";
import { DifficultyType } from "./questions.model";

export interface AllDocumentsQueryModel {
  courseId: string;
  title: string;
  page: number;
  pageSize: number;
  id: string;
}

export interface AllDocumentsModel {
  id: string;
  createdAt: Date;
  title: string;
  questionSetCount: number;
  questionIds: string[];
  averageScore: number | null;
}

export interface GetAllDocumentsModel {
  documents: AllDocumentsModel[];
  meta: MetaModel;
}

export interface CreateDocumentModel {
  documentId: string;
  questionId: string;
  type: string;
}

export interface AddDocumentPayloadModel {
  payload: {
    title: string;
    fileId: string;
    topics?: string[];
    selectedQuestionTopics?: string[];
  };
  questionCount: string;
  questionType: string;
  difficulty: DifficultyType;
  includeUseCases: boolean;
}

export interface UpdateDocumentPayloadModel {
  title?: string;
  isDeleted?: boolean;
  id: string;
}

export interface DocumentSummaryModel {
  id: string;
  documentId: string;
  summary: string;
  createdOn: string;
}

export interface DocumentSummaryQuery {
  documentId: string;
}

export interface DocumentFileQuery {
  documentId: string;
}

export interface DocumentFileModel {
  // originalFile: string;
  modifiedFile: string;
}

export interface SprintReadDocumentModel {
  content: string[];
  totalPages: number
}

export interface SprintReadDocumentFileQuery {
  documentId: string;
}

export interface StoredFileThumbnailModel {
  thumbnailUrl: string;
  iframUrl: string;
}

export interface StoredFileThumbnailQuery {
  documentId: string;
}

export interface DocumentContentQuery {
  documentId: string;
}

export interface DocumentContentModel {
  content: string[];
  pageCount: number;
}

export interface DocumentImageSearchQuery {
  query: string;
  documentId: string;
}

export interface DocumentImageSearchModel {
  imageUrl: string;
  title: string;
}
