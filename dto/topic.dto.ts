import { MetaDto } from "./meta.dto";

export interface TopicDto {
  id: string;
  title: string;
  courseId: string;
  userId: string;
  createdOn: Date;
  questionCount: number;
}

export interface AllTopicsDto {
  data: {
    courseDocuments: TopicDto[];
    meta: MetaDto;
  };
  status: number;
}
