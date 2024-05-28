import { MetaModel } from "./meta.model";

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
  averageScore: number | null
}

export interface GetAllDocumentsModel {
  documents: AllDocumentsModel[];
  meta: MetaModel;
}

export interface CreateDocumentModel {
  documentId: string;
  questionId: string;
}

export interface AddDocumentPayloadModel {
  payload: {
    title: string;
    fileId: string;
    topics?: string[]
  }
  questionCount: string;
}
