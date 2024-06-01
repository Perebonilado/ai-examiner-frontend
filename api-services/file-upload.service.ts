import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import { logout } from "@/utils";
import {
  FileUploadModel,
  FileUploadPayloadModel,
} from "@/models/file-upload.model";
import { FileUploadDto } from "@/dto/file-upload.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/file-upload`,
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

export const FileUploadService = createApi({
  reducerPath: "file-upload-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration,
  endpoints: (build) => ({
    uploadFile: build.mutation<FileUploadModel, FileUploadPayloadModel>({
      query: ({ payload }) => ({
        url: "",
        body: payload,
        method: 'POST'
      }),
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

export const { useUploadFileMutation } = FileUploadService