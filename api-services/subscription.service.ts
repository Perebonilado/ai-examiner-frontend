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
import {
  CancelSubscriptionModel,
  CancelSubscriptionPayloadModel,
  InitiateSubscriptionModel,
  InitiateSubscriptionQueryModel,
  RestartSubscriptionModel,
  RestartSubscriptionPayloadModel,
} from "@/models/subscription.model";
import {
  CancelSubscriptionDto,
  InitiateSubscriptionDto,
  RestartSubscriptionDto,
} from "@/dto/subscription.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/subscription`,
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

export const SubscriptionService = createApi({
  reducerPath: "subscription",
  tagTypes: [""],
  baseQuery: baseQueryWithLogoutOnTokenExpiration,
  endpoints: (build) => {
    return {
      initiateSubscription: build.query<
        InitiateSubscriptionModel,
        InitiateSubscriptionQueryModel
      >({
        query: ({ planId }) => ({
          url: `/initiate`,
          params: {
            planId,
          },
        }),
        transformResponse: (res: InitiateSubscriptionDto) => {
          if (!res) return <InitiateSubscriptionModel>{};
          else {
            return {
              redirectUrl: res.redirectUrl,
            };
          }
        },
      }),
      cancelSubscription: build.mutation<
        CancelSubscriptionModel,
        CancelSubscriptionPayloadModel
      >({
        query: (body) => ({
          url: "/cancel",
          method: "POST",
          body,        
        }),
        transformResponse: (res: CancelSubscriptionDto) => {
          if (!res) return <CancelSubscriptionModel>{};
          else return res;
        },
      }),
      restartSubscription: build.mutation<
        RestartSubscriptionModel,
        RestartSubscriptionPayloadModel
      >({
        query: (body) => ({
          url: "/restart",
          method: "POST",
          body,        
        }),
        transformResponse: (res: RestartSubscriptionDto) => {
          if (!res) return <RestartSubscriptionModel>{};
          else return res;
        },
      }),
    };
  },
});
