import { MetaDto } from "./meta.dto";

export interface CourseDto {
  id: string;
  title: string;
  description: string;
  createdOn: Date;
  createdBy: string | null;
  modifiedOn: Date | null;
  modifiedBy: string | null;
  userId: string;
  courseDocument: string[]
}

export interface AllCoursesDto {
  data: {
    courses: CourseDto[];
    meta: MetaDto;
  };
  status: number;
}

export interface GetCourseByIdDto {
  data: CourseDto;
  status: number;
}
