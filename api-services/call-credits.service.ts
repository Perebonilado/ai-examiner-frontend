import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";
import {
  CallCreditsModel,
  PurchaseCallCreditsModel,
  PurchaseCallCreditsPayloadModel,
} from "@/models/call-credits.model";
import { CallCreditsDto, PurchaseCallCreditsDto } from "@/dto/call-credits.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/call-credits`,
  timeout: secondsToMilliSeconds(600),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const CallCreditsService = createApi({
  reducerPath: "call-credits-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  tagTypes: ["call-credits"],
  endpoints: (build) => ({
    getCallCredits: build.query<CallCreditsModel, ''>({
      query: () => ({
        url: "",
      }),
      extraOptions: { triggerLoading: false },
      transformResponse: (res: CallCreditsDto) => {
        if (!res) return <CallCreditsModel>{};
        return res;
      },
      providesTags: ["call-credits"],
    }),
    initiateCallCreditsPurchase: build.mutation<
      PurchaseCallCreditsModel,
      PurchaseCallCreditsPayloadModel
    >({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
      transformResponse: (res: PurchaseCallCreditsDto) => {
        if (!res) return <PurchaseCallCreditsModel>{};
        return {
          accessCode: res.data.accessCode,
          redirectUrl: res.data.redirectUrl,
        };
      },
      invalidatesTags: ["call-credits"],
    }),
  }),
});

export const {
  useGetCallCreditsQuery,
  useInitiateCallCreditsPurchaseMutation,
} = CallCreditsService;
