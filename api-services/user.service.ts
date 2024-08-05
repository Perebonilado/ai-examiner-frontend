import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import {
  baseQueryWithLogoutOnTokenExpiration,
  capitalizeFirstLetterOfEachWord,
  secondsToMilliSeconds,
} from "@/utils";
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

export const UserService = createApi({
  reducerPath: "user",
  tagTypes: ["profile"],
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  endpoints: (build) => ({
    getUserProfile: build.query<UserProfileModel, "">({
      query: () => ({
        url: "profile",
      }),
      transformResponse: (res: UserProfileDto) => {
        if (!res) return <UserProfileModel>{};
        else
          return {
            firstName: capitalizeFirstLetterOfEachWord(
              res.firstName.toLowerCase()
            ),
            lastName: capitalizeFirstLetterOfEachWord(
              res.lastName.toLowerCase()
            ),
            email: res.email,
          };
      },
    }),
  }),
});

export const { useGetUserProfileQuery } = UserService;
