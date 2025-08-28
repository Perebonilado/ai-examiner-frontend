import { TopicV2DTO } from "@/dto/file-upload.dto";

export interface FileUploadModel {
  fileId: string;
}

export interface TopicsV2Model {
  id: number;
  title: string;
  startPage: number;
  endPage: number;
  shortDescription: string;
}

export interface FileUploadModelV2 extends FileUploadModel {
  documentId: string;
  topics: string[];
  topicsWithPages: TopicsV2Model[];
  summary: string;
}

export interface FileUploadPayloadModel {
  payload: FormData;
  pages?: string;
  start?: string;
  end?: string;
}

export interface ExtractWrittenTextPayload {
  payload: FormData;
  start?: string;
  end?: string;
}
