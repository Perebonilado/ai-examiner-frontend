import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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
  DocumentFileModel,
  DocumentFileQuery,
  DocumentSummaryModel,
  DocumentSummaryQuery,
  GetAllDocumentsModel,
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
    getOriginalDocumentFile: build.query<DocumentFileModel, DocumentFileQuery>({
      query: ({ documentId }) => ({
        url: `/original-document-file/${documentId}`,
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
} = DocumentService;
