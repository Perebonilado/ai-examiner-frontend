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
  count: number;
}
