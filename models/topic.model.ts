import { MetaModel } from "./meta.model";

export interface AllTopicsQueryModel {
  courseId: string;
  title: string;
  page: number;
  pageSize: number;
  id: string
}

export interface AllTopicsModel {
  id: string;
  createdAt: Date;
  title: string
  questionSetCount: number;
  questionIds: string[]
}

export interface GetAllTopicsModel {
  topics: AllTopicsModel[];
  meta: MetaModel;
}
