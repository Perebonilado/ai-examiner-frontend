import { MetaDto } from "./meta.dto";

export interface DocumentDto {
  id: string;
  title: string;
  courseId: string;
  userId: string;
  createdOn: Date;
  question: { id: string }[];
  averageScore: number | null
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
  };
}
