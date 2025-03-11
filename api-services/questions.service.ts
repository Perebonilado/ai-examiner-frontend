import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import {
  CreateScorePayloadModel,
  DeleteQuestionModel,
  GenerateQuestionsPayloadModel,
  GetMultipleTrueFalseQuestionByIdModel,
  GetQuestionByIdModel,
  GetQuestionSummaryModel,
  GetQuestionsQueryModel,
  QuestionSourceRequestModel,
  QuestionSourceRequestPayloadModel,
  StartVivaPayload,
  StartVivaResponseModel,
  VivaRecordingModel,
  VivaRecordingPayload,
} from "@/models/questions.model";
import Cookies from "js-cookie";
import {
  AllQuestionSummaryDto,
  GenerateQuestionsDto,
  GetQuestionsByIdDto,
} from "@/dto/questions.dto";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";
import { PermissionService } from "./permission.service";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/questions`,
  timeout: secondsToMilliSeconds(3000),
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
    getQuestionsById: build.query<
      GetQuestionByIdModel | GetMultipleTrueFalseQuestionByIdModel,
      string
    >({
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
              topic: q?.topic,
            })),
            documentTitle: res.documentTitle,
            documentId: res.documentId,
            createdOn: res.createdOn,
            topics: res.topics.map((t) => t.title),
            allTopics: res.allTopics,
            fileId: res.fileId,
            analysis: !res?.analysisData
              ? null
              : {
                  analysisData: res.analysisData.analysis.map((d, i) => {
                    return {
                      grade: d.score > 5 ? "pass" : "fail",
                      score: d.score,
                      question: d.question,
                      questionNumber: i + 1,
                      totalQuestions: res.analysisData?.analysis?.length || 0,
                      systemResponse: d.systemAnalysis,
                      userResponse: d.userResponse,
                    };
                  }),
                  callId: res.analysisData.callId,
                },
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
    getVivaRecording: build.query<VivaRecordingModel, VivaRecordingPayload>({
      query: ({ callId }) => ({
        url: `/viva/call-recording/${callId}`,
        method: "GET",
      }),
    }),
    startVivaCall: build.mutation<StartVivaResponseModel, StartVivaPayload>({
      query: (body) => ({
        url: `/viva/start-call`,
        method: "POST",
        body,
      }),
      extraOptions: {
        triggerLoading: false,
      },
    }),
    questionSourceRequest: build.mutation<
      QuestionSourceRequestModel,
      QuestionSourceRequestPayloadModel
    >({
      query: ({ documentId, question }) => ({
        url: `/source/${documentId}`,
        method: "POST",
        body: {
          question,
        },
      }),
      extraOptions: {
        triggerLoading: false,
      },
    }),
    getQuestionSummaries: build.query<
      GetQuestionSummaryModel,
      GetQuestionsQueryModel
    >({
      query: (query) => ({
        url: ``,
        method: "GET",
        params: { ...query, showOralQuestions: '1' },
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
            progressPercentage: d.progressPercentage,
            count: d.count,
            status: d.status ?? null,
            totalAnswered: d.totalAnswered,
            documentId: d.courseDocumentId,
            score: d.score,
            topics: d?.topics.map((t) => t.title),
          })),
        };
      },
    }),
    generateQuestions: build.mutation<
      GenerateQuestionsDto,
      GenerateQuestionsPayloadModel
    >({
      query: ({
        documentId,
        questionCount,
        questionType,
        includeUseCases,
        difficulty,
        ...body
      }) => ({
        url: `/${documentId}/generate-questions`,
        method: "POST",
        params: {
          questionCount,
          questionType,
          includeUseCases,
          difficulty
        },
        body,
      }),
      extraOptions: {
        triggerLoading: false,
      },
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
  useDeleteQuestionMutation,
  useQuestionSourceRequestMutation,
  useStartVivaCallMutation,
  useGetVivaRecordingQuery
} = QuestionsService;
