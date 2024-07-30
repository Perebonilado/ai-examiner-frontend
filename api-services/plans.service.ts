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

export const PlanService = createApi({
  reducerPath: "plan",
  tagTypes: ["plans"],
  baseQuery: baseQueryWithLogoutOnTokenExpiration,
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
            return res.map((plan) => {
              return {
                costPerMonth: plan.amount,
                currency: plan.currency,
                offers: plan.description.split(","),
                type: plan.planName,
                planId: plan.planId,
              };
            });
          }
        },
      }),
    };
  },
});

export const { useGetPlansQuery } = PlanService;
