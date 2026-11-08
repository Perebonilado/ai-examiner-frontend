import Cookies from "js-cookie";
import { API_BASE_URL, accessToken } from "@/constants";
import { SendMessagePayloadModel } from "@/models/document-message.model";
import { createSseParser } from "@/@modules/chat/chatStreamUtils";

export interface ChatStreamMeta {
  mode: "document" | "passages";
  pages: number[];
}

export interface ChatStreamDone {
  status: "done" | "truncated" | "refused";
  messageId?: string;
  /** For a refusal: the notice to show instead of the reply. */
  text?: string;
}

/**
 * - unavailable: the backend has no streaming endpoint yet (use the JSON one)
 * - auth: signed out
 * - failed: anything else (the question is saved; retry with retry: true)
 */
export class ChatStreamError extends Error {
  constructor(
    message: string,
    public kind: "unavailable" | "auth" | "failed",
    public status?: number
  ) {
    super(message);
    this.name = "ChatStreamError";
  }
}

export interface StreamPayload extends SendMessagePayloadModel {
  language?: string;
  retry?: boolean;
}

/**
 * Sends a chat message and reads the reply as it's written. Resolves when the reply is complete;
 * rejects with ChatStreamError, or with an AbortError when `signal` aborts.
 */
export const streamDocumentMessage = async (
  payload: StreamPayload,
  {
    signal,
    onMeta,
    onThinking,
    onDelta,
  }: {
    signal: AbortSignal;
    onMeta?: (meta: ChatStreamMeta) => void;
    onThinking?: () => void;
    onDelta: (text: string) => void;
  }
): Promise<ChatStreamDone> => {
  const token = Cookies.get(accessToken);
  const response = await fetch(`${API_BASE_URL}/document-message/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message : "";
    if (response.status === 401) {
      throw new ChatStreamError(message || "Signed out", "auth", 401);
    }
    // Nest's own 404 for a route it doesn't have ("Cannot POST ..."), not "Document not found".
    if (response.status === 404 && /cannot post/i.test(message)) {
      throw new ChatStreamError(message, "unavailable", 404);
    }
    throw new ChatStreamError(
      message || "Something went wrong",
      "failed",
      response.status
    );
  }

  // Set from inside the parser callback.
  const outcome: { done: ChatStreamDone | null; failure: string | null } = {
    done: null,
    failure: null,
  };
  const feed = createSseParser((event, raw) => {
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }
    if (event === "delta" && typeof data?.text === "string") onDelta(data.text);
    else if (event === "meta") onMeta?.(data);
    else if (event === "thinking") onThinking?.();
    else if (event === "done") outcome.done = data;
    else if (event === "error")
      outcome.failure = data?.message || "Something went wrong";
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { value, done: finished } = await reader.read();
    if (finished) break;
    feed(decoder.decode(value, { stream: true }));
  }
  feed(decoder.decode());

  if (outcome.done) return outcome.done;
  throw new ChatStreamError(
    outcome.failure || "The reply was interrupted",
    "failed"
  );
};
