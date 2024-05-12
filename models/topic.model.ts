import { MetaModel } from "./meta.model";

export interface AllTopicsQueryModel {
  courseId: string;
  title: string;
  page: number;
  pageSize: number;
}

export interface AllTopicsModel {
  id: string;
  createdAt: Date;
  title: string
  questionSetCount: number
}

export interface GetAllTopicsModel {
  topics: AllTopicsModel[];
  meta: MetaModel;
}
