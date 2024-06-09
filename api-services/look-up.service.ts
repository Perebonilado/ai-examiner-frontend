import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import { LookUpDto } from "@/dto/look-up.dto";
import { GetLookUpByTypeQueryModel, LookUpModel } from "@/models/look-up.model";
import { logout, secondsToMilliSeconds } from "@/utils";
import Cookies from "js-cookie";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/look-up`,
  timeout: secondsToMilliSeconds(30),
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

export const LookUpService = createApi({
  reducerPath: "look-ups",
  tagTypes: ["look-up-by-id"],
  baseQuery: baseQueryWithLogoutOnTokenExpiration,
  endpoints: (build) => ({
    getLookUpsByType: build.query<LookUpModel[], GetLookUpByTypeQueryModel>({
      query: ({ type }) => ({
        url: "",
        params: {
          type,
        },
      }),
      providesTags: ["look-up-by-id"],
      transformResponse: (res: LookUpDto[]) => {
        if (!res) return <LookUpModel[]>[];
        else
          return res.map((r) => {
            if (r.title.toLowerCase() === "multiple choice") {
              return {
                label: r.title,
                value: r.id,
                defaultSelected: true,
              };
            }

            return {
              label: r.title,
              value: r.id,
            };
          });
      },
    }),
  }),
});

export const { useGetLookUpsByTypeQuery } = LookUpService;
