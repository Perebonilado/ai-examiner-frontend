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
import { AllCoursesDto } from "@/dto/course.dto";

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
  tagTypes: ["all-courses"],
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
            };
          });

          return {
            meta: res.data.meta,
            courses,
          };
        }
      },
    }),
  }),
});

export const { useGetAllUserCoursesQuery } = CourseService;
