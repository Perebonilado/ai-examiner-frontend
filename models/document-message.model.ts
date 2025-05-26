import { NotSureQuestion } from "./questions.model";

export interface DocumentMessageModel {
  id: string;
  message: string;
  sender: string;
  createdOn: Date;
  image?: string;
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
  notSureQuestion?: NotSureQuestion;
  highlightToPrompt?: HighlightToPrompt;
  imageDescriptionData?: {
    imageUrl: string;
  };
}

export interface SendMessageModel {
  message: string;
}

export type HighlightToPromptType =
  | "explain"
  | "simplify"
  | "define"
  | "visualize";

export interface HighlightToPrompt {
  question: string;
  highlight: HighlightToPromptType;
}
