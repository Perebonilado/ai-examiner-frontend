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
  AllTopicsModel,
  AllTopicsQueryModel,
  GetAllTopicsModel,
} from "@/models/topic.model";
import { AllTopicsDto } from "@/dto/topic.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/course-document`,
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

export const TopicService = createApi({
  reducerPath: "topic-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration,
  tagTypes: ["all-topics"],
  endpoints: (build) => ({
    getAllUserTopics: build.query<GetAllTopicsModel, AllTopicsQueryModel>({
      query: (queryParams) => ({
        url: "",
        params: { ...queryParams },
      }),
      providesTags: ["all-topics"],
      transformResponse: (res: AllTopicsDto) => {
        if (!res) return <GetAllTopicsModel>{};

        const topics = res.data.courseDocuments.map((topic) => {
          return <AllTopicsModel>{
            createdAt: topic.createdOn,
            id: topic.id,
            title: topic.title,
            questionSetCount: topic.questionCount
          };
        });

        return {
          topics,
          meta: res.data.meta,
        };
      },
    }),
  }),
});

export const { useGetAllUserTopicsQuery } = TopicService;
