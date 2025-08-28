import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";
import Cookies from "js-cookie";
import {
  CreateReadingProgressPayloadModel,
  DeleteReadingProgressPayloadModel,
} from "@/dto/reading-progress.dto";
import { DocumentTopicService } from "./document-topic.service";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/reading-progress`,
  timeout: secondsToMilliSeconds(30),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const ReadingProgressService = createApi({
  reducerPath: "reading-progress",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  endpoints: (build) => {
    return {
      createReadingProgress: build.mutation<
        any,
        CreateReadingProgressPayloadModel
      >({
        query: (body) => ({
          url: "",
          body,
          method: "POST",
        }),
        onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
          try {
            await queryFulfilled;
            dispatch(
              DocumentTopicService.util.invalidateTags(["document-topics-v2"])
            );
          } catch (error) {}
        },
      }),
      deleteReadingProgress: build.mutation<
        any,
        DeleteReadingProgressPayloadModel
      >({
        query: (body) => ({
          url: "",
          body,
          method: "DELETE",
        }),
        onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
          try {
            await queryFulfilled;
            dispatch(
              DocumentTopicService.util.invalidateTags(["document-topics-v2"])
            );
          } catch (error) {}
        },
      }),
    };
  },
});

export const {
  useCreateReadingProgressMutation,
  useDeleteReadingProgressMutation,
} = ReadingProgressService;
