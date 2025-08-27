export type DocumentTopicDto = string[];

export interface SavedDocumentTopicDto {
  id: number;
  title: string;
}

export interface DocumentTopicv2DTO {
  id: number;
  startPage: number;
  endPage: number;
  shortDescription: string;
  title: string;
  isRead: boolean;
}
