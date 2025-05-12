import { MetaDto } from "./meta.dto";

export interface DocumentDto {
  id: string;
  title: string;
  courseId: string;
  userId: string;
  createdOn: Date;
  question: { id: string }[];
  averageScore: number | null;
}

export interface AllDocumentsDto {
  data: {
    courseDocuments: DocumentDto[];
    meta: MetaDto;
  };
  status: number;
}

export interface CreateDocumentDto {
  status: number;
  message: string;
  data: {
    documentId: string;
    questionId: string;
    type: string;
  };
}

export interface DocumentSummaryDto {
  id: string;
  documentId: string;
  summary: string;
  createdOn: string;
}

export interface DocumentFileDto {
  originalFile: Buffer;
  modifiedFile: Buffer;
}