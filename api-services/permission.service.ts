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

export const PermissionService = createApi({
  reducerPath: "permission",
  tagTypes: ["permission"],
  baseQuery: baseQueryWithLogoutOnTokenExpiration,
  endpoints: (build) => ({
    getPermissions: build.query<PermissionModel, "">({
      query: () => ({
        url: "",
      }),
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
