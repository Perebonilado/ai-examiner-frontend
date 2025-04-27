export interface FileUploadModel {
  fileId: string;
}

export interface FileUploadModelV2 extends FileUploadModel {
  documentId: string;
  topics: string[];
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
}

