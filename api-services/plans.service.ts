import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";
import Cookies from "js-cookie";
import { PlanModel } from "@/models/plan.model";
import { PlanDto } from "@/dto/plan.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/plan`,
  timeout: secondsToMilliSeconds(30),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const PlanService = createApi({
  reducerPath: "plan",
  tagTypes: ["plans"],
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  endpoints: (build) => {
    return {
      getPlans: build.query<PlanModel[], "">({
        query: () => ({
          url: "",
        }),
        providesTags: ["plans"],
        transformResponse: (res: PlanDto[]) => {
          if (!res) return <PlanModel[]>[];
          else {
            const plans = res
              .map((plan) => {
                const offers = Object.entries(plan.description.features).map(
                  ([title, isAvailable]) => {
                    return { title, isAvailable };
                  }
                );
                return {
                  costPerMonth: plan.amount,
                  currency: plan.currency,
                  offers,
                  type: plan.planName,
                  planId: plan.planId,
                  region: plan.description.region,
                  interval: plan.interval,
                };
              })
              .sort((a, b) => b.type.localeCompare(a.type));

            return [...plans];
          }
        },
      }),
    };
  },
});

export const { useGetPlansQuery } = PlanService;
