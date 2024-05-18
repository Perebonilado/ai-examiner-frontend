import { MetaDto } from "./meta.dto";

export interface TopicDto {
  id: string;
  title: string;
  courseId: string;
  userId: string;
  createdOn: Date;
  question: {id: string}[]
}

export interface AllTopicsDto {
  data: {
    courseDocuments: TopicDto[];
    meta: MetaDto;
  };
  status: number;
}
