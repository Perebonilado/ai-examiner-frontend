import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";
import {
  CreatePreferredLanguageDto,
  GetUserPreferredLanguageDto,
  UpdatePreferredLanguageDto,
} from "@/dto/preferred-language.dto";
import {
  CreatePreferredLanguagePayloadModel,
  UpdatePreferredLanguagePayloadModel,
} from "@/models/preferred-language.model";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/preferred-language`,
  timeout: secondsToMilliSeconds(6000),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const PreferredLanguageService = createApi({
  reducerPath: "preferred-language-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  tagTypes: ['preferred-language'],
  endpoints: (build) => ({
    getPreferredLanguage: build.query<GetUserPreferredLanguageDto, "">({
      query: () => ({
        url: "",
      }),
      providesTags: ['preferred-language']
    }),
    createPreferredLanguage: build.mutation<
      CreatePreferredLanguageDto,
      CreatePreferredLanguagePayloadModel
    >({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
      invalidatesTags: ['preferred-language']
    }),
    updatePreferredLanguageMutation: build.mutation<
      UpdatePreferredLanguageDto,
      UpdatePreferredLanguagePayloadModel
    >({
      query: (body) => ({
        url: "",
        method: "PUT",
        body,
      }),
      invalidatesTags: ['preferred-language']
    }),
  }),
});

export const {
  useCreatePreferredLanguageMutation,
  useGetPreferredLanguageQuery,
  useUpdatePreferredLanguageMutationMutation
} = PreferredLanguageService;
