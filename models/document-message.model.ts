import { NotSureQuestion } from "./questions.model";

export interface DocumentMessageModel {
  id: string;
  message: string;
  sender: string;
  createdOn: Date;
}

export interface DocumentMessagesModel {
  data: DocumentMessageModel[];
  count: number;
}

export interface DocumentMessageQueryModel {
  courseDocumentId: string;
  limit: number;
  lastMessageCreatedOn?: Date;
}

export interface SendMessagePayloadModel {
  message: string;
  courseDocumentId: string;
  responseFormat: string;
  notSureQuestion?: NotSureQuestion
}

export interface SendMessageModel {
  message: string;
}
