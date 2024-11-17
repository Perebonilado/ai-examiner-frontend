import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import {
  baseQueryWithLogoutOnTokenExpiration,
  logout,
  secondsToMilliSeconds,
} from "@/utils";
import {
  QuestionProgressModel,
  QuestionProgressPayloadModel,
  QuestionProgressQueryModel,
} from "@/models/question-progress.model";
import { QuestionProgressDto } from "@/dto/question-progress.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/question-progress`,
  timeout: secondsToMilliSeconds(600),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const QuestionProgressService = createApi({
  reducerPath: "question-progress",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  tagTypes: [""],
  endpoints: (build) => ({
    saveProgress: build.mutation<any, QuestionProgressPayloadModel>({
      query: ({ data, id, clearExistingProgress, status }) => ({
        url: `/${id}`,
        method: "POST",
        body: data,
        params: {
          status,
          clearExistingProgress,
        },
      }),
      extraOptions: {
        triggerLoading: false,
      },
    }),
    getProgress: build.query<QuestionProgressModel, QuestionProgressQueryModel>(
      {
        query: ({ id }) => ({
          url: `/${id}`,
        }),
        keepUnusedDataFor: 0,
        extraOptions: {
          triggerLoading: false,
        },
        transformResponse: (res: QuestionProgressDto) => {
          if (!res) return <QuestionProgressModel>{};
          else {
            return {
              data: res.data,
              score: res.score,
              status: res.status,
            };
          }
        },
      }
    ),
  }),
});

export const { useGetProgressQuery, useSaveProgressMutation } =
  QuestionProgressService;
