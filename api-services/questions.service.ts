import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import {
  GetQuestionByIdModel,
  GetQuestionSummaryModel,
  GetQuestionsQueryModel,
  QuestionsModel,
} from "@/models/questions.model";
import Cookies from "js-cookie";
import {
  AllQuestionSummaryDto,
  GetQuestionsByIdDto,
  QuestionsDto,
} from "@/dto/questions.dto";
import { logout, secondsToMilliSeconds } from "@/utils";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/questions`,
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
  tagTypes: ["question-summary", "single-question"],
  endpoints: (build) => ({
    getQuestionsById: build.query<GetQuestionByIdModel, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: ["single-question"],
      transformResponse: (res: GetQuestionsByIdDto) => {
        if (!res) return <GetQuestionByIdModel>{};
        else {
          return {
            data: res.questions.map((q) => ({
              answerId: q.correctAnswerId,
              explanation: q.explanation,
              id: q.id,
              options: q.options,
              question: q.question,
              correctAnswerId: q.correctAnswerId,
            })),
            topicTitle: res.topicTitle,
            topicId: res.topicId,
            createdOn: res.createdOn
          };
        }
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
    generateQuestions: build.mutation<any, string>({
      query: (topicId) => ({
        url: `/${topicId}/generate-questions`,
        method: "POST",
      }),
      invalidatesTags: ["question-summary"]
    }),
  }),
});

export const { useGetQuestionsByIdQuery, useGetQuestionSummariesQuery, useGenerateQuestionsMutation } =
  QuestionsService;
