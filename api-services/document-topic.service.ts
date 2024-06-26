import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import { logout, secondsToMilliSeconds } from "@/utils";
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

export const DocumentTopicService = createApi({
  reducerPath: "document-topic-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration,
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
      invalidatesTags: ['document-topics'],
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
