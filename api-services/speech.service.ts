import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";
import Cookies from "js-cookie";
import { TextToSpeechPayloadModel } from "@/models/speech.model";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/speech`,
  timeout: secondsToMilliSeconds(30),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const SpeechService = createApi({
  reducerPath: "speech",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  endpoints: (build) => {
    return {
      convertTextToSpeech: build.mutation<any, TextToSpeechPayloadModel>({
        query: (body) => {
          return {
            url: "/convert-text",
            body,
            method: "POST",
            responseHandler: (response) => response.blob(),
          };
        },
        extraOptions: {
          triggerLoading: false,
        },
      }),
    };
  },
});

export const { useConvertTextToSpeechMutation } = SpeechService;
