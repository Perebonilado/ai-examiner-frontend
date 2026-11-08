import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SimplifiedPagesModel } from "@/models/simplified-pages.model";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";
import {
  AddDocumentPayloadModel,
  AllDocumentsModel,
  AllDocumentsQueryModel,
  CreateDocumentModel,
  DocumentContentModel,
  DocumentContentQuery,
  DocumentFileModel,
  DocumentFileQuery,
  DocumentImageSearchModel,
  DocumentImageSearchQuery,
  DocumentSummaryModel,
  DocumentSummaryQuery,
  GetAllDocumentsModel,
  SprintReadDocumentFileQuery,
  SprintReadDocumentModel,
  StoredFileThumbnailModel,
  StoredFileThumbnailQuery,
  UpdateDocumentPayloadModel,
} from "@/models/document.model";
import {
  AllDocumentsDto,
  CreateDocumentDto,
  DocumentFileDto,
  DocumentSummaryDto,
  StoredFileThumbnailDto,
} from "@/dto/document.dto";
import {
  GetRelatedYoutubeVideosQuery,
  YoutubeRelatedVideoModel,
} from "@/models/youtube.model";
import { YouTubeVideoItemDTO } from "@/dto/youtube.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/course-document`,
  timeout: secondsToMilliSeconds(6000),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const DocumentService = createApi({
  reducerPath: "document-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  tagTypes: ["all-documents", "related-videos", "summary"],
  endpoints: (build) => ({
    getAllUserDocuments: build.query<
      GetAllDocumentsModel,
      AllDocumentsQueryModel
    >({
      query: (queryParams) => ({
        url: "",
        params: { ...queryParams },
      }),
      extraOptions: {
        triggerLoading: false,
      },
      providesTags: ["all-documents"],

      transformResponse: (res: AllDocumentsDto) => {
        if (!res) return <GetAllDocumentsModel>{};

        const documents = res.data.courseDocuments.map((document) => {
          return <AllDocumentsModel>{
            createdAt: document.createdOn,
            id: document.id,
            title: document.title,
            questionSetCount: document.question.length,
            questionIds: document.question.map((q) => q.id),
            averageScore: document.averageScore,
          };
        });

        return {
          documents,
          meta: res.data.meta,
        };
      },
    }),
    addDocument: build.mutation<CreateDocumentModel, AddDocumentPayloadModel>({
      query: ({
        payload,
        questionCount,
        questionType,
        includeUseCases,
        difficulty,
      }) => ({
        url: ``,
        body: payload,
        method: "POST",
        params: {
          questionCount,
          questionType,
          includeUseCases,
          difficulty,
        },
      }),
      extraOptions: { triggerLoading: false },
      invalidatesTags: ["all-documents"],
      transformResponse: (res: CreateDocumentDto) => {
        if (!res) return <CreateDocumentModel>{};
        else
          return {
            documentId: res.data.documentId,
            questionId: res.data.questionId,
            type: res.data.type,
          };
      },
    }),
    getDocumentSummary: build.query<DocumentSummaryModel, DocumentSummaryQuery>(
      {
        query: ({ documentId }) => ({
          url: `/summary/${documentId}`,
        }),
        providesTags: ["summary"],
        transformResponse: (res: DocumentSummaryDto) => {
          if (!res) return <DocumentSummaryModel>{};
          return res;
        },
        extraOptions: {
          triggerLoading: false,
        },
      }
    ),
    updateDocument: build.mutation<any, UpdateDocumentPayloadModel>({
      query: (body) => ({
        url: "",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["all-documents"],
    }),
    getRelatedYoutubeVideos: build.query<
      YoutubeRelatedVideoModel[],
      GetRelatedYoutubeVideosQuery
    >({
      query: ({ documentId }) => ({
        url: `/youtube-search/${documentId}`,
      }),
      extraOptions: { triggerLoading: false },
      providesTags: ["related-videos"],
      transformResponse: (res: YouTubeVideoItemDTO[]) => {
        if (!res) return <YoutubeRelatedVideoModel[]>[];
        return res.map((data) => {
          return {
            videoId: data.videoId,
            title: data.title,
            description: data.description,
            channelTitle: data.author.name,
            thumbnail: data.thumbnail,
          };
        });
      },
    }),
    getModifiedDocumentFile: build.query<DocumentFileModel, DocumentFileQuery>({
      query: ({ documentId }) => ({
        url: `/modified-document-file/${documentId}`,
        responseHandler: (response) => response.blob(),
      }),
      transformResponse: (blob: Blob) => {
        if (!blob) return {} as DocumentFileModel;

        return {
          modifiedFile: URL.createObjectURL(blob),
        };
      },
      extraOptions: {
        triggerLoading: false,
      },
    }),
    getSprintReadDocumentFile: build.query<
      SprintReadDocumentModel,
      SprintReadDocumentFileQuery
    >({
      query: ({ documentId }) => ({
        url: `/sprint-read/${documentId}`,
      }),
    }),
    getOriginalDocumentFile: build.query<DocumentFileModel, DocumentFileQuery>({
      query: ({ documentId }) => ({
        url: `/original-document-file/${documentId}`,
        // The PDF on success; the JSON error body otherwise (e.g. EASY_READ_LIMIT_REACHED).
        responseHandler: (response) =>
          response.ok ? response.blob() : response.json().catch(() => ({})),
      }),
      transformResponse: (blob: Blob) => {
        if (!blob) return {} as DocumentFileModel;

        return {
          modifiedFile: URL.createObjectURL(blob),
        };
      },
      // Easy Read shows its own error and its own "out of free minutes" prompt.
      extraOptions: {
        triggerLoading: false,
        silentErrors: true,
      },
    }),
    getFileThumbnailDetails: build.query<
      StoredFileThumbnailModel,
      StoredFileThumbnailQuery
    >({
      query: ({ documentId }) => ({
        url: `/stored-file-information/${documentId}`,
      }),
      transformResponse: (res: StoredFileThumbnailDto) => {
        if (!res)
          return <StoredFileThumbnailModel>{
            thumbnailUrl: "",
            iframUrl: "",
          };
        return {
          thumbnailUrl: res.thumbnailUrl ?? "",
          iframUrl: res.iframUrl ?? "",
        };
      },
      extraOptions: {
        triggerLoading: false,
      },
    }),
    getModifiedContent: build.query<DocumentContentModel, DocumentContentQuery>(
      {
        query: ({ documentId }) => ({
          url: `/modified-content/${documentId}`,
        }),
        // Easy Read's fallback for backends without /simplified-pages; it shows its own errors.
        extraOptions: {
          triggerLoading: false,
          silentErrors: true,
        },
      }
    ),
    /** Easy Read: simplified pages as they're ready (asked again every couple of seconds). */
    getSimplifiedPages: build.query<
      SimplifiedPagesModel,
      { documentId: string; priority: number; have: string }
    >({
      query: ({ documentId, priority, have }) => ({
        url: `/simplified-pages/${documentId}`,
        params: { priority, ...(have ? { have } : {}) },
      }),
      keepUnusedDataFor: 0,
      // Asked every 2s: Easy Read handles errors itself (retries, then a message).
      extraOptions: {
        triggerLoading: false,
        silentErrors: true,
      },
    }),
    getWebImageSearch: build.query<
      DocumentImageSearchModel[],
      DocumentImageSearchQuery
    >({
      query: ({ query, documentId }) => ({
        url: `/web-images/search/${documentId}`,
        params: {
          query,
        },
      }),
      extraOptions: {
        triggerLoading: false,
      },
    }),
  }),
});

export const {
  useGetAllUserDocumentsQuery,
  useAddDocumentMutation,
  useUpdateDocumentMutation,
  useGetDocumentSummaryQuery,
  useGetRelatedYoutubeVideosQuery,
  useGetModifiedDocumentFileQuery,
  useGetOriginalDocumentFileQuery,
  useGetFileThumbnailDetailsQuery,
  useGetModifiedContentQuery,
  useLazyGetModifiedContentQuery,
  useLazyGetSimplifiedPagesQuery,
  useGetWebImageSearchQuery,
  useGetSprintReadDocumentFileQuery
} = DocumentService;
