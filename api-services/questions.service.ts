import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../constants";
import { secondsToMilliSeconds } from "../utils";
import { QuestionsModel } from "@/models/questions.model";
import { QuestionsDto } from "@/dto/questions.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/questions/`,
});

export const QuestionsService = createApi({
  reducerPath: "questions",
  baseQuery,
  endpoints: (build) => ({
    generateMCQs: build.mutation<QuestionsModel[], FormData>({
      query: (body) => ({
        url: "generate-mcq",
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
              correctAnswerId: res.correctAnswerId
            };
          });
      },
    }),
  }),
});

export const { useGenerateMCQsMutation } = QuestionsService;
