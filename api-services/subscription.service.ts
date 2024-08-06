import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import {
  baseQueryWithLogoutOnTokenExpiration,
  capitalizeWords,
  removeHyphens,
  secondsToMilliSeconds,
} from "@/utils";
import Cookies from "js-cookie";
import {
  CancelSubscriptionModel,
  CancelSubscriptionPayloadModel,
  InitiateSubscriptionModel,
  InitiateSubscriptionPayloadModel,
  RestartSubscriptionModel,
  RestartSubscriptionPayloadModel,
  SubscriptionDetailsModel,
} from "@/models/subscription.model";
import {
  CancelSubscriptionDto,
  InitiateSubscriptionDto,
  RestartSubscriptionDto,
  SubscriptionDetailsDto,
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

export const SubscriptionService = createApi({
  reducerPath: "subscription",
  tagTypes: [""],
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  endpoints: (build) => {
    return {
      initiateSubscription: build.mutation<
        InitiateSubscriptionModel,
        InitiateSubscriptionPayloadModel
      >({
        query: ({ planId }) => ({
          url: `/initiate`,
          method: "POST",
          body: {
            planId,
          },
        }),
        transformResponse: (res: InitiateSubscriptionDto) => {
          if (!res) return <InitiateSubscriptionModel>{};
          else {
            return {
              redirectUrl: res.data.redirectUrl,
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
      getSubscriptionDetails: build.query<SubscriptionDetailsModel, "">({
        query: () => ({
          url: "/details",
        }),
        extraOptions: { triggerLoading: false },
        transformResponse: (res: SubscriptionDetailsDto) => {
          if (!res) return <SubscriptionDetailsModel>{};
          else {
            return {
              billing: [
                ["Account name", res.cardInformation.accountName || "N/A"],
                ["Bank", res.cardInformation.bank || "N/A"],
                [
                  "Expiration month",
                  res.cardInformation.expirationMonth || "N/A",
                ],
                [
                  "Expiration year",
                  res.cardInformation.expirationYear || "N/A",
                ],
                [
                  "Last 4 digits",
                  res.cardInformation.last4
                    ? `**** **** **** ${res.cardInformation.last4}`
                    : null || "N/A",
                ],
              ],
              subscription: [
                ["Plan", res.planInformation.name || "N/A"],
                ["Frequency", "Monthly"],
                [
                  "Amount",
                  res.planInformation?.amount
                    ? `${res.planInformation.currency}${res.planInformation.amount}`
                    : null || "N/A",
                ],
                [
                  "Status",
                  res.subscrptionInformation.status
                    ? capitalizeWords(
                        removeHyphens(res.subscrptionInformation.status)
                      )
                    : "N/A",
                ],
              ],
              status: res.subscrptionInformation.status,
            };
          }
        },
      }),
    };
  },
});

export const {
  useCancelSubscriptionMutation,
  useInitiateSubscriptionMutation,
  useRestartSubscriptionMutation,
  useGetSubscriptionDetailsQuery,
} = SubscriptionService;
