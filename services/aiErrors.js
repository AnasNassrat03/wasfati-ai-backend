import {
  APIError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  APIConnectionError,
  APIConnectionTimeoutError,
  RateLimitError,
  InternalServerError,
} from "openai";

// Thrown when the model responds but the content is unusable (non-JSON or missing fields).
export class AiResponseError extends Error {}

// Maps any error from the AI pipeline to an HTTP status + client-safe message.
export function classifyAiError(error) {
  if (error instanceof AiResponseError) {
    return { reason: "bad_ai_response", status: 502, message: "AI returned an unusable response." };
  }
  if (error instanceof AuthenticationError) {
    return { reason: "invalid_api_key", status: 502, message: "AI service authentication failed." };
  }
  if (error instanceof PermissionDeniedError) {
    return { reason: "permission_denied", status: 502, message: "AI service access denied." };
  }
  if (error instanceof NotFoundError) {
    return { reason: "model_not_found", status: 502, message: "AI model not found." };
  }
  // Timeout subclasses connection error, so check it first.
  if (error instanceof APIConnectionTimeoutError) {
    return { reason: "timeout", status: 503, message: "AI service timed out." };
  }
  if (error instanceof APIConnectionError) {
    return { reason: "connection_error", status: 503, message: "AI service unreachable." };
  }
  if (error instanceof RateLimitError) {
    const code = error.error?.code ?? error.code;
    if (code === "insufficient_quota" || code === "billing_hard_limit_reached") {
      return { reason: "no_credits", status: 429, message: "AI service quota exceeded." };
    }
    return { reason: "rate_limited", status: 429, message: "AI service rate limit reached." };
  }
  if (error instanceof InternalServerError) {
    return { reason: "openai_server_error", status: 502, message: "AI service error." };
  }
  if (error instanceof APIError) {
    return { reason: "api_error", status: 502, message: "AI service error." };
  }
  return { reason: "unexpected_error", status: 500, message: "Failed to generate summary." };
}
