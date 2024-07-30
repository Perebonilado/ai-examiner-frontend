import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import { logout, secondsToMilliSeconds } from "@/utils";
import Cookies from "js-cookie";
import { UserProfileModel } from "@/models/user.model";
import { UserProfileDto } from "@/dto/user.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/user`,
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

export const UserService = createApi({
  reducerPath: "user",
  tagTypes: ["profile"],
  baseQuery: baseQueryWithLogoutOnTokenExpiration,
  endpoints: (build) => ({
    getUserProfile: build.query<UserProfileModel, "">({
      query: () => ({
        url: "profile",
      }),
      transformResponse: (res: UserProfileDto) => {
        if (!res) return <UserProfileModel>{};
        else return res;
      },
    }),
  }),
});

export const { useGetUserProfileQuery } = UserService;
