export interface DocumentMessageDTO {
  id: string;
  message: string;
  sender: string;
  createdOn: Date;
  image?: string;
}

export interface DocumentMessagesDTO {
  data: DocumentMessageDTO[];
  totalCount: number;
}

export interface SendMessageDto {
  data: {
    systemResponse: string;
  };
  message: string;
  status: number;
}
