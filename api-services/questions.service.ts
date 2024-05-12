import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import {
  GetQuestionSummaryModel,
  GetQuestionsQueryModel,
  QuestionSummaryModel,
  QuestionsModel,
} from "@/models/questions.model";
import Cookies from "js-cookie";
import { AllQuestionSummaryDto, QuestionsDto } from "@/dto/questions.dto";
import { logout, secondsToMilliSeconds } from "@/utils";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/questions`,
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

export const QuestionsService = createApi({
  reducerPath: "questions",
  baseQuery: baseQueryWithLogoutOnTokenExpiration,
  tagTypes: ["question-summary"],
  endpoints: (build) => ({
    generateMCQs: build.mutation<QuestionsModel[], FormData>({
      query: (body) => ({
        url: "/generate-mcq",
        method: "POST",
        body,
      }),
      transformResponse: (res: QuestionsDto[]) => {
        if (!res) return <QuestionsModel[]>[];
        else
          return res.map((res) => {
            return {
              answerId: res.correctAnswerId,
              explanation: res.explanation,
              id: res.id,
              options: res.options,
              question: res.question,
              correctAnswerId: res.correctAnswerId,
            };
          });
      },
    }),
    getQuestionSummaries: build.query<
      GetQuestionSummaryModel,
      GetQuestionsQueryModel
    >({
      query: (query) => ({
        url: ``,
        method: "GET",
        params: { ...query },
      }),
      providesTags: ["question-summary"],
      transformResponse: (res: AllQuestionSummaryDto) => {
        if (!res) return <GetQuestionSummaryModel>{};

        return {
          meta: res.meta,
          questions: res.data.map((d) => ({
            id: d.id,
            type: "Multiple Choice",
            createdAt: d.createdOn,
            count: d.count,
            documentId: d.courseDocumentId,
          })),
        };
      },
    }),
  }),
});

export const { useGenerateMCQsMutation, useGetQuestionSummariesQuery } =
  QuestionsService;
