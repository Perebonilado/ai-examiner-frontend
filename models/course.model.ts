import { MetaModel } from "./meta.model";

export interface AllCoursesQueryModel {
  page: number;
  pageSize: number;
  title: string;
}

export interface AllCoursesModel {
  id: string;
  title: string;
  description: string;
  topicCount: number;
  createdAt: Date;
}

export interface GetAllCoursesModel {
  courses: AllCoursesModel[];
  meta: MetaModel;
}
