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
                return {
                  costPerMonth: plan.amount,
                  currency: plan.currency,
                  offers: plan.description.split(","),
                  type: plan.planName,
                  planId: plan.planId,
                };
              })
              .sort((a, b) => b.type.localeCompare(a.type));

            const freePlan = {
              costPerMonth: 0,
              currency: plans[0].currency,
              offers: [
                "10 Q&A's/test",
                "3 tests / month",
                "Random topic generation",
                "Multiple choice questions",
              ],
              type: "Free",
              planId: 4098888376,
            };

            return [freePlan, ...plans];
          }
        },
      }),
    };
  },
});

export const { useGetPlansQuery } = PlanService;
