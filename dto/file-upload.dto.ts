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
    topics: string[];
    topicsWithPages: TopicV2DTO[];
    summary: string;
  };
  message: string;
  status: number;
}

export interface TopicV2DTO {
  id: number;
  title: string;
  startPage: number;
  endPage: number;
  documentId: string;
  shortDescription: string;
}
