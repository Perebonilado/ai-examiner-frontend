import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import { baseQueryWithLogoutOnTokenExpiration, secondsToMilliSeconds } from "@/utils";
import {
  AllCoursesModel,
  AllCoursesQueryModel,
  CreateCoursePayloadModel,
  GetAllCoursesModel,
} from "@/models/course.model";
import { AllCoursesDto, GetCourseByIdDto } from "@/dto/course.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/course`,
  timeout: secondsToMilliSeconds(3000),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});


export const CourseService = createApi({
  reducerPath: "course-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  tagTypes: ["all-courses", "single-course"],
  endpoints: (build) => ({
    getAllUserCourses: build.query<GetAllCoursesModel, AllCoursesQueryModel>({
      query: (queryParams) => ({
        url: "",
        params: { ...queryParams },
        method: "GET",
      }),
      providesTags: ["all-courses"],
      transformResponse: (res: AllCoursesDto) => {
        if (!res) return <GetAllCoursesModel>{};
        else {
          const courses = res.data.courses.map((course) => {
            return <AllCoursesModel>{
              createdAt: course.createdOn,
              id: course.id,
              documentCount: course.courseDocument.length || 0,
              title: course.title,
              description: course.description,
            };
          });

          return {
            meta: res.data.meta,
            courses,
          };
        }
      },
    }),
    getCourseById: build.query<AllCoursesModel, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: ["single-course"],
      transformResponse: (res: GetCourseByIdDto) => {
        if (!res) return <AllCoursesModel>{};

        return <AllCoursesModel>{
          title: res.data.title,
          createdAt: res.data.createdOn,
          description: res.data.description,
          id: res.data.id,
          documentCount: res.data.courseDocument.length || 0,
        };
      },
    }),
    createCourse: build.mutation<any, CreateCoursePayloadModel>({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
      invalidatesTags: ["all-courses"]
    }),
  }),
});

export const {
  useGetAllUserCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
} = CourseService;
