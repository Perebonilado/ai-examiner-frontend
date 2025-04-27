import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import {
  baseQueryWithLogoutOnTokenExpiration,
  logout,
  secondsToMilliSeconds,
} from "@/utils";
import {
  ExtractWrittenTextPayload,
  FileUploadModel,
  FileUploadModelV2,
  FileUploadPayloadModel,
} from "@/models/file-upload.model";
import { FileUploadDto, FileUploadDtoV2 } from "@/dto/file-upload.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/file-upload`,
  timeout: secondsToMilliSeconds(6000),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const FileUploadService = createApi({
  reducerPath: "file-upload-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  endpoints: (build) => ({
    uploadFile: build.mutation<FileUploadModel, FileUploadPayloadModel>({
      query: ({ payload, pages = "", end = "", start = "" }) => ({
        url: "",
        body: payload,
        method: "POST",
        params: {
          pages,
          end,
          start,
        },
      }),
      extraOptions: { triggerLoading: false },
      transformResponse: (res: FileUploadDto) => {
        if (!res) return <FileUploadModel>{};
        else {
          return {
            fileId: res.data.fileId,
          };
        }
      },
    }),
    uploadFileV2: build.mutation<FileUploadModelV2, FileUploadPayloadModel>({
      query: ({ payload, pages = "", end = "", start = "" }) => ({
        url: "/v2",
        body: payload,
        method: "POST",
        params: {
          pages,
          end,
          start,
        },
      }),
      extraOptions: { triggerLoading: false },
      transformResponse: (res: FileUploadDtoV2) => {
        if (!res) return <FileUploadModelV2>{};
        else {
          return {
            fileId: res.data.fileId,
            documentId: res.data.documentId,
            topics: res.data.topics,
            summary: res.data.summary,
          };
        }
      },
    }),
    exteactWrittenText: build.mutation<string[], ExtractWrittenTextPayload>({
      query: ({ payload, start, end }) => ({
        url: "/extract-written-text",
        method: "POST",
        body: payload,
        params: {
          start: start || "",
          end: end || "",
        },
      }),
    }),
  }),
});

export const {
  useUploadFileMutation,
  useUploadFileV2Mutation,
  useExteactWrittenTextMutation,
} = FileUploadService;
