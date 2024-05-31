export interface DocumentTopicQueryModel {
  fileId: string;
}

export interface DocumentTopicModel {
  topics: {value: string; label: string}[];
}

export interface SavedDocumentTopicQueryModel {
  documentId: string
}