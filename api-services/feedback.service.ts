import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { API_BASE_URL, accessToken } from "../constants";
import { baseQueryWithLogoutOnTokenExpiration, secondsToMilliSeconds } from "@/utils";

/** What a student can rate: one chat answer, one test, or Easy Read for one document. */
export type FeedbackKind = "chat_answer" | "test" | "easy_read";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/feedback`,
  timeout: secondsToMilliSeconds(20),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

// Ratings are a side channel: never block the page with the loader or an error toast.
const quiet = { triggerLoading: false, silentErrors: true } as const;

export const FeedbackService = createApi({
  reducerPath: "feedback-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  tagTypes: ["ratings"],
  endpoints: (build) => ({
    /** The student's own ratings for some items, as { itemId: 1 | -1 }. */
    getMyRatings: build.query<Record<string, number>, { kind: FeedbackKind; ids: string[] }>({
      query: ({ kind, ids }) => ({ url: "", params: { kind, ids: ids.join(",") } }),
      providesTags: ["ratings"],
      extraOptions: quiet,
    }),
    rate: build.mutation<
      { saved: boolean; rating?: number },
      { kind: FeedbackKind; itemId: string; rating: 1 | -1 | 0; comment?: string }
    >({
      query: (body) => ({ url: "", method: "POST", body }),
      extraOptions: quiet,
    }),
  }),
});

export const { useGetMyRatingsQuery, useRateMutation } = FeedbackService;
