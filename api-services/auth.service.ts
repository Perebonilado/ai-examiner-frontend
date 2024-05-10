import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../constants";
import { LoginDto } from "@/dto/auth.dto";
import { LoginPayload } from "@/models/auth.model";
import { secondsToMilliSeconds } from "@/utils";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/auth/`,
  timeout: secondsToMilliSeconds(30),
});

export const AuthService = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (build) => ({
    login: build.mutation<LoginDto, LoginPayload>({
      query: (body) => ({
        url: "login",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLoginMutation } = AuthService;
