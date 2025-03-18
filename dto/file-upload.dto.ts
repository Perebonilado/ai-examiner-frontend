export interface FileUploadDto {
  data: {
    fileId: string;
  };
  message: string;
  status: number;
}

export interface FileUploadDtoV2 {
  data: {
    fileId: string;
    documentId: string;
    topics: string[]
  };
  message: string;
  status: number;
}