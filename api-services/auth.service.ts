import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../constants";
import {
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  SignUpDto,
} from "@/dto/auth.dto";
import {
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignUpPayload,
} from "@/models/auth.model";
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
    signUp: build.mutation<SignUpDto, SignUpPayload>({
      query: (body) => ({
        url: "sign-up",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: build.mutation<ForgotPasswordDto, ForgotPasswordPayload>({
      query: (body) => ({
        url: "forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: build.mutation<ResetPasswordDto, ResetPasswordPayload>({
      query: (body) => ({
        url: "reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignUpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = AuthService;
