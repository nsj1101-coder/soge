import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown, message: string) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

type TokenProvider = () => string | null;
type UnauthorizedHandler = () => void;

let tokenProvider: TokenProvider = () => null;
let onUnauthorized: UnauthorizedHandler = () => {};

export const configureApiClient = (opts: {
  getToken: TokenProvider;
  onUnauthorized?: UnauthorizedHandler;
}): void => {
  tokenProvider = opts.getToken;
  if (opts.onUnauthorized !== undefined) {
    onUnauthorized = opts.onUnauthorized;
  }
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {
    Accept: "application/json"
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = tokenProvider();
    if (token !== null) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const payload = text.length === 0 ? null : safeJsonParse(text);

  if (response.status === 401) {
    onUnauthorized();
    throw new ApiError(401, payload, "unauthorized");
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload,
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as { error: unknown }).error)
        : `request_failed_${response.status}`
    );
  }

  return payload as T;
};

const safeJsonParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};
