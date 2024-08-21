import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import {
  baseQueryWithLogoutOnTokenExpiration,
  logout,
  secondsToMilliSeconds,
} from "@/utils";
import {
  FileUploadModel,
  FileUploadPayloadModel,
} from "@/models/file-upload.model";
import { FileUploadDto } from "@/dto/file-upload.dto";

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
      query: ({ payload }) => ({
        url: "",
        body: payload,
        method: "POST",
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
  }),
});

export const { useUploadFileMutation } = FileUploadService;
