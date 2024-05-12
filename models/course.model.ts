export interface AllCoursesQueryModel {
  page: number;
  pageSize: number;
  title: string;
}

export interface AllCoursesModel {
  id: string;
  title: string;
  questionCount: number;
  createdAt: Date;
}
