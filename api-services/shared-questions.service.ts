import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import {
  CreateScorePayloadModel,
  DeleteQuestionModel,
  GenerateQuestionsPayloadModel,
  GetQuestionByIdModel,
  GetQuestionSummaryModel,
  GetQuestionsQueryModel,
  GetSharedQuestionModel,
  GetSharedQuestionQueryModel,
  SaveSharedQuestionQueryModel,
} from "@/models/questions.model";
import Cookies from "js-cookie";
import {
  AllQuestionSummaryDto,
  GetQuestionsByIdDto,
  SharedQuestionDto,
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

export const SharedQuestionsService = createApi({
  reducerPath: "shared-questions",
  baseQuery,
  tagTypes: [],
  endpoints: (build) => ({
    getSharedQuestion: build.query<
      GetSharedQuestionModel,
      GetSharedQuestionQueryModel
    >({
      query: ({ questionId }) => ({
        url: `/shared/${questionId}`,
      }),
      transformResponse: (res: SharedQuestionDto) => {
        if (!res) return <GetSharedQuestionModel>{};
        else {
          return {
            createdOn: res.createdOn,
            data: res.questions.map((q) => ({
              answerId: q.correctAnswerId,
              explanation: q.explanation,
              id: q.id,
              options: q.options,
              question: q.question,
              correctAnswerId: q.correctAnswerId,
              hint: q.hint,
            })),
            sharedBy: res.sharedBy,
            documentTitle: res.documentTitle,
          };
        }
      },
    }),
    saveSharedQuestion: build.mutation<any, SaveSharedQuestionQueryModel>({
      query: ({ questionId }) => ({
        url: `/shared/save`,
        method: "POST",
        body: { questionId },
      }),
    }),
  }),
});

export const {
  useSaveSharedQuestionMutation,
  useGetSharedQuestionQuery
} = SharedQuestionsService;
