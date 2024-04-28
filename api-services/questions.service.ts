import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../constants";
import { secondsToMilliSeconds } from "../utils";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/job/`,
  timeout: secondsToMilliSeconds(30),
});

export const QuestionsService = createApi({
  reducerPath: "questions",
  baseQuery,
  endpoints: (build) => ({
    generateMCQs: build.mutation<"", FormData>({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGenerateMCQsMutation } = QuestionsService;
