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
  GetAllDocumentsModel,
  UpdateDocumentPayloadModel,
} from "@/models/document.model";
import { AllDocumentsDto, CreateDocumentDto } from "@/dto/document.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/course-document`,
  timeout: secondsToMilliSeconds(3000),
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
  tagTypes: ["all-documents"],
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
      query: ({ payload, questionCount, questionType, includeUseCases }) => ({
        url: ``,
        body: payload,
        method: "POST",
        params: {
          questionCount,
          questionType,
          includeUseCases,
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
    updateDocument: build.mutation<any, UpdateDocumentPayloadModel>({
      query: (body) => ({
        url: "",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["all-documents"],
    }),
  }),
});

export const {
  useGetAllUserDocumentsQuery,
  useAddDocumentMutation,
  useUpdateDocumentMutation,
} = DocumentService;
