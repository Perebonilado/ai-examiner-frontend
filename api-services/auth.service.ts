import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../constants";
import {
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  SignUpDto,
  ConfirmEmailDto,
} from "@/dto/auth.dto";
import {
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignUpPayload,
} from "@/models/auth.model";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/auth/`,
  timeout: secondsToMilliSeconds(30),
});

export const AuthService = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
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
    createGuestAccount: build.mutation<SignUpDto, undefined>({
      query: () => ({
        url: "create-guest-account",
        method: "POST",
        body: {},
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
    confirmEmail: build.mutation<ConfirmEmailDto, { token: string }>({
      query: (body) => ({ url: "confirm-email", method: "POST", body }),
      // The page shows its own message.
      extraOptions: { triggerLoading: false, silentErrors: true },
    }),
    resendConfirmation: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "resend-confirmation", method: "POST", body }),
      extraOptions: { triggerLoading: false },
    }),
  }),
});

export const {
  useConfirmEmailMutation,
  useResendConfirmationMutation,
  useLoginMutation,
  useSignUpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useCreateGuestAccountMutation
} = AuthService;
