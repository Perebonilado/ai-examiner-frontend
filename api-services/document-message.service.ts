import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, accessToken } from "../constants";
import Cookies from "js-cookie";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";
import {
  DocumentMessageModel,
  DocumentMessageQueryModel,
  DocumentMessagesModel,
  SendMessageModel,
  SendMessagePayloadModel,
} from "@/models/document-message.model";
import {
  DocumentMessageDTO,
  DocumentMessagesDTO,
  SendMessageDto,
} from "@/dto/document-message.dto";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/document-message`,
  timeout: secondsToMilliSeconds(600),
  prepareHeaders(headers) {
    const token = Cookies.get(accessToken);

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const DocumentMessageService = createApi({
  reducerPath: "document-message-api",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  tagTypes: [],
  endpoints: (build) => ({
    sendMessage: build.mutation<SendMessageModel, SendMessagePayloadModel>({
      query: (body) => ({
        url: ``,
        method: "POST",
        body,
      }),
      extraOptions: { triggerLoading: false },
      transformResponse: (res: SendMessageDto) => {
        if (!res) return <SendMessageModel>{};
        else {
          return {
            message: res.data.systemResponse,
          };
        }
      },
    }),
    getDocumentMessages: build.query<
      DocumentMessagesModel,
      DocumentMessageQueryModel
    >({
      query: ({ courseDocumentId, ...rest }) => ({
        url: `/${courseDocumentId}`,
        params: { ...rest },
        extraOptions: { triggerLoading: false },
      }),
      transformResponse: (res: DocumentMessagesDTO) => {
        if (!res) return <DocumentMessagesModel>{};
        else {
          return {
            ...res,
            count: res.totalCount
          };
        }
      },
    }),
  }),
});

export const { useGetDocumentMessagesQuery, useSendMessageMutation } =
  DocumentMessageService;
