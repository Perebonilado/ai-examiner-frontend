import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import {
  CreateScorePayloadModel,
  DeleteQuestionModel,
  GenerateQuestionsPayloadModel,
  GetQuestionByIdModel,
  GetQuestionSummaryModel,
  GetQuestionsQueryModel,
} from "@/models/questions.model";
import Cookies from "js-cookie";
import {
  AllQuestionSummaryDto,
  GetQuestionsByIdDto,
} from "@/dto/questions.dto";
import { baseQueryWithLogoutOnTokenExpiration } from "@/utils";
import { PermissionService } from "./permission.service";

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

export const QuestionsService = createApi({
  reducerPath: "questions",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  tagTypes: ["question-summary", "single-question"],
  endpoints: (build) => ({
    getQuestionsById: build.query<GetQuestionByIdModel, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: ["single-question"],
      extraOptions: {
        triggerLoading: false,
      },
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
              hint: q.hint,
            })),
            documentTitle: res.documentTitle,
            documentId: res.documentId,
            createdOn: res.createdOn,
            topics: res.topics.map((t) => t.title),
          };
        }
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            PermissionService.util.prefetch("getPermissions", "", {
              force: true,
            })
          );
        } catch (error) {}
      },
    }),
    deleteQuestion: build.mutation<any, DeleteQuestionModel>({
      query: ({ questionId }) => ({
        url: `/${questionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["question-summary"],
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
      extraOptions: {
        triggerLoading: false,
      },
      providesTags: ["question-summary"],
      transformResponse: (res: AllQuestionSummaryDto) => {
        if (!res) return <GetQuestionSummaryModel>{};

        return {
          meta: res.meta,
          fileId: res.data.fileId,
          questions: res.data.data.map((d) => ({
            id: d.id,
            type: d.type,
            createdAt: d.createdOn,
            count: d.count,
            documentId: d.courseDocumentId,
            score: d.score,
            topics: d?.topics.map((t) => t.title),
          })),
        };
      },
    }),
    generateQuestions: build.mutation<any, GenerateQuestionsPayloadModel>({
      query: ({ documentId, questionCount, questionType, includeUseCases, ...body }) => ({
        url: `/${documentId}/generate-questions`,
        method: "POST",
        params: {
          questionCount,
          questionType,
          includeUseCases
        },
        body,
      }),
      invalidatesTags: ["question-summary"],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            PermissionService.util.prefetch("getPermissions", "", {
              force: true,
            })
          );
        } catch (error) {}
      },
    }),
    saveScore: build.mutation<any, CreateScorePayloadModel>({
      query: (body) => ({
        url: "/score",
        method: "POST",
        body,
      }),
      extraOptions: { triggerLoading: false },
      invalidatesTags: ["question-summary", "single-question"],
    }),
  }),
});

export const {
  useGetQuestionsByIdQuery,
  useGetQuestionSummariesQuery,
  useGenerateQuestionsMutation,
  useSaveScoreMutation,
  useDeleteQuestionMutation
} = QuestionsService;
