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
import { toast } from "react-toastify";

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

/**
 * Shows topics as read (or unread) in every cached topics list straight away, before the server
 * answers. Returns an undo for when the request fails.
 */
const setTopicsReadInCache = (
  dispatch: (action: any) => any,
  state: unknown,
  topicIds: number[],
  isRead: boolean
) => {
  const ids = new Set(topicIds);
  const patches = DocumentTopicService.util
    .selectCachedArgsForQuery(state as any, "getAllSavedDocumentTopicsV2")
    .map((args) =>
      dispatch(
        DocumentTopicService.util.updateQueryData(
          "getAllSavedDocumentTopicsV2",
          args,
          (topics) => {
            for (const topic of topics) {
              if (ids.has(topic.id)) topic.isRead = isRead;
            }
          }
        )
      )
    );
  return () => patches.forEach((patch) => patch.undo());
};

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
        // The list changes at once (no full-screen loader); a failed save is undone and toasted.
        extraOptions: { triggerLoading: false, silentErrors: true },
        onQueryStarted: async (
          { topicIds },
          { dispatch, getState, queryFulfilled }
        ) => {
          const undo = setTopicsReadInCache(dispatch, getState(), topicIds, true);
          try {
            await queryFulfilled;
            dispatch(
              DocumentTopicService.util.invalidateTags(["document-topics-v2"])
            );
          } catch (error) {
            undo();
            toast.error("Couldn't mark those topics as read. Try again.");
          }
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
        extraOptions: { triggerLoading: false, silentErrors: true },
        onQueryStarted: async (
          { topicIds },
          { dispatch, getState, queryFulfilled }
        ) => {
          const undo = setTopicsReadInCache(dispatch, getState(), topicIds, false);
          try {
            await queryFulfilled;
            dispatch(
              DocumentTopicService.util.invalidateTags(["document-topics-v2"])
            );
          } catch (error) {
            undo();
            toast.error("Couldn't mark those topics as unread. Try again.");
          }
        },
      }),
    };
  },
});

export const {
  useCreateReadingProgressMutation,
  useDeleteReadingProgressMutation,
} = ReadingProgressService;
