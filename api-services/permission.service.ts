import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import {
  baseQueryWithLogoutOnTokenExpiration,
  logout,
  secondsToMilliSeconds,
} from "@/utils";
import Cookies from "js-cookie";
import { PermissionModel } from "@/models/permission.model";
import { PermissionDto } from "@/dto/permission.dto";
import { setPermissions } from "@/features/permissionSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/permission`,
  timeout: secondsToMilliSeconds(30),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const PermissionService = createApi({
  reducerPath: "permission",
  tagTypes: ["permission"],
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  endpoints: (build) => ({
    getPermissions: build.query<PermissionModel, "">({
      query: () => ({
        url: "",
      }),
      extraOptions: {
        triggerLoading: false,
      },
      transformResponse: (res: PermissionDto) => {
        if (!res) return <PermissionModel>{};
        return res;
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setPermissions(data));
        } catch (error) {}
      },
    }),
  }),
});

export const { useGetPermissionsQuery } = PermissionService;
