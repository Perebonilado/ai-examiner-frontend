import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { API_BASE_URL, accessToken } from "../constants";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";
import { EasyReadAllowanceModel } from "@/models/easy-read.model";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/easy-read`,
  timeout: secondsToMilliSeconds(30),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

/** Free plan: 10 minutes of Easy Read a month. The server keeps the count and enforces it. */
export const EasyReadService = createApi({
  reducerPath: "easy-read",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  tagTypes: ["allowance"],
  endpoints: (build) => ({
    getEasyReadAllowance: build.query<EasyReadAllowanceModel, void>({
      query: () => ({ url: "/allowance" }),
      providesTags: ["allowance"],
      keepUnusedDataFor: 0,
    }),
    recordEasyReadUsage: build.mutation<EasyReadAllowanceModel, { seconds: number }>({
      query: (body) => ({ url: "/usage", method: "POST", body }),
      // The response is the updated allowance: write it straight into the cached query.
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            EasyReadService.util.updateQueryData(
              "getEasyReadAllowance",
              undefined,
              () => data
            )
          );
        } catch {
          // Leave the cached allowance as it is; the next report tries again.
        }
      },
    }),
  }),
});

/** Sends unreported reading time when the page is hidden or closed (survives the unload). */
export const flushEasyReadUsage = (seconds: number) => {
  if (seconds <= 0) return;
  const token = Cookies.get(accessToken);
  try {
    fetch(`${API_BASE_URL}/easy-read/usage`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ seconds }),
    }).catch(() => {});
  } catch {
    // Best effort: the server counts what it receives.
  }
};

export const { useGetEasyReadAllowanceQuery, useRecordEasyReadUsageMutation } =
  EasyReadService;
