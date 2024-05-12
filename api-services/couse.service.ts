import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import { logout, secondsToMilliSeconds } from "@/utils";
import {
  AllCoursesModel,
  AllCoursesQueryModel,
  GetAllCoursesModel,
} from "@/models/course.model";
import { AllCoursesDto, GetCourseByIdDto } from "@/dto/course.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/course`,
  timeout: secondsToMilliSeconds(30),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithLogoutOnTokenExpiration: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    logout(() => {
      window.location.pathname = "/auth/login";
    });
  }
  return result;
};

export const CourseService = createApi({
  reducerPath: "course-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration,
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
              topicCount: course.topicCount,
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
          topicCount: res.data.topicCount,
        };
      },
    }),
  }),
});

export const { useGetAllUserCoursesQuery, useGetCourseByIdQuery } = CourseService;
