import { MetaModel } from "./meta.model";

export interface AllTopicsQueryModel {
  courseId: string;
  title: string;
  page: number;
  pageSize: number;
}

export interface AllTopicsModel {
  id: string;
  type: string;
  createdAt: Date;
}

export interface GetAllTopicsModel {
  topics: AllTopicsModel[];
  meta: MetaModel;
}
