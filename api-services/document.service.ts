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
  AddDocumentPayloadModel,
  AllDocumentsModel,
  AllDocumentsQueryModel,
  CreateDocumentModel,
  GetAllDocumentsModel,
} from "@/models/document.model";
import { AllDocumentsDto, CreateDocumentDto } from "@/dto/document.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/course-document`,
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

export const DocumentService = createApi({
  reducerPath: "document-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration,
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
            averageScore: document.averageScore
          };
        });

        return {
          documents,
          meta: res.data.meta,
        };
      },
    }),
    addDocument: build.mutation<CreateDocumentModel, AddDocumentPayloadModel>({
      query: ({ formData, questionCount }) => ({
        url: ``,
        body: formData,
        method: "POST",
        params: {
          questionCount,
        },
      }),
      invalidatesTags: ["all-documents"],
      transformResponse: (res: CreateDocumentDto) => {
        if (!res) return <CreateDocumentModel>{};
        else
          return {
            documentId: res.data.documentId,
            questionId: res.data.questionId,
          };
      },
    }),
  }),
});

export const { useGetAllUserDocumentsQuery, useAddDocumentMutation } =
  DocumentService;
