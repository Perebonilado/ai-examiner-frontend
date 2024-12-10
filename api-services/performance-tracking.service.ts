import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";
import {
  PerformanceTrackingModel,
  PerformanceTrackingPerQuestionModel,
  PerformanceTrackingPerQuestionQueryModel,
  PerformanceTrackingQueryModel,
} from "@/models/performance-tracking.model";
import {
  PerformanceTrackingDto,
  PerformanceTrackingPerQuestionDto,
} from "@/dto/performane-tracking.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/performance-tracking`,
  timeout: secondsToMilliSeconds(6000),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const PerformanceTrackingService = createApi({
  reducerPath: "performance-tracking-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  tagTypes: ["document-performance", "question-performance"],
  endpoints: (build) => ({
    getPerformanceTrackingForDocument: build.query<
      PerformanceTrackingModel,
      PerformanceTrackingQueryModel
    >({
      query: ({ documentId, period }) => ({
        url: `/${documentId}`,
        params: {
          period,
        },
      }),
      providesTags: ["document-performance"],
      extraOptions: {
        triggerLoading: true,
      },
      transformResponse: (res: PerformanceTrackingDto) => {
        if (!res) return <PerformanceTrackingModel>{};
        else {
          return res;
        }
      },
    }),
    getPerformanceTrackingForQuestion: build.query<
      PerformanceTrackingPerQuestionModel,
      PerformanceTrackingPerQuestionQueryModel
    >({
      query: ({ questionId }) => ({
        url: `/question/${questionId}`,
      }),
      providesTags: ["question-performance"],
      transformResponse: (res: PerformanceTrackingPerQuestionDto) => {
        if (!res) return <PerformanceTrackingPerQuestionModel>{};
        else return res;
      },
    }),
  }),
});

export const {
  useGetPerformanceTrackingForDocumentQuery,
  useGetPerformanceTrackingForQuestionQuery,
} = PerformanceTrackingService;
