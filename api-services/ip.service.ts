import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";

const baseQuery = fetchBaseQuery({
  baseUrl: `https://ipinfo.io/json`,
  timeout: secondsToMilliSeconds(30),
});

export interface IpInfoModel {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  timezone: string;
}

export const IpService = createApi({
  reducerPath: "ip-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  endpoints: (build) => ({
    getUserIpInfo: build.query<IpInfoModel, any>({
      query: () => ({
        url: `?token=1b026d0a4d4e61`,
      }),
    }),
  }),
});

export const { useGetUserIpInfoQuery } = IpService;
