import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import {
  baseQueryWithLogoutOnTokenExpiration,
  logout,
  secondsToMilliSeconds,
} from "@/utils";
import {
  DocumentTopicModel,
  DocumentTopicQueryModel,
  SavedDocumentTopicQueryModel,
} from "@/models/document-topic.model";
import {
  DocumentTopicDto,
  SavedDocumentTopicDto,
} from "@/dto/document-topic.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/document-topic`,
  timeout: secondsToMilliSeconds(600),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const DocumentTopicService = createApi({
  reducerPath: "document-topic-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  tagTypes: ["document-topics"],
  endpoints: (build) => ({
    generateDocumentTopics: build.mutation<
      DocumentTopicModel,
      DocumentTopicQueryModel
    >({
      query: ({ fileId, documentId }) => ({
        url: `/generate/${fileId}`,
        method: "POST",
        body: {},
        params: {
          documentId,
        },
      }),
      extraOptions: { triggerLoading: false },
      invalidatesTags: ["document-topics"],
      transformResponse: (res: DocumentTopicDto) => {
        if (!res) return <DocumentTopicModel>{};
        else
          return {
            topics: res.map((r) => {
              return { value: r, label: r };
            }),
          };
      },
    }),
    getAllSavedDocumentTopics: build.query<
      DocumentTopicModel,
      SavedDocumentTopicQueryModel
    >({
      query: ({ documentId }) => ({
        url: ``,
        params: {
          documentId,
        },
      }),
      providesTags: ["document-topics"],
      transformResponse: (res: SavedDocumentTopicDto[]) => {
        if (!res) return <DocumentTopicModel>{};
        else {
          return {
            topics: res.map((t) => ({ value: `${t.id}`, label: t.title })),
          };
        }
      },
    }),
  }),
});

export const {
  useGenerateDocumentTopicsMutation,
  useGetAllSavedDocumentTopicsQuery,
} = DocumentTopicService;
