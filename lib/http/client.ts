import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';
import { ErrorCodes, INLINE_AUTH_ERROR_CODES } from '../error-codes';

export interface PaginationMeta {
  total?: number;
  page?: number;
  per_page?: number;
  total_pages?: number;
  has_next?: boolean;
  has_prev?: boolean;
  limit?: number;
  next_cursor?: string;
  previous_cursor?: string;
  has_next_page?: boolean;
  has_previous_page?: boolean;
}

export interface SuccessResponse<T = unknown> {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
  meta: {
    request_id: string;
    timestamp: string;
    api_version: string;
    path?: string;
    status?: number;
  };
}

import {
  ApiError,
  TimeoutError,
  NetworkError,
  createAppropriateError,
  BackendErrorResponse,
  ErrorResponseDetails,
} from './errors';
// Callback for handling 401 responses
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(callback: () => void) {
  onUnauthorized = callback;
}

export interface ApiSuccessResponse<T = unknown> {
  data: SuccessResponse<T>;
  error: null;
  status: number;
  headers: AxiosHeaders;
}

export interface ApiErrorResponse {
  data: null;
  error: BackendErrorResponse;
  status: number;
  headers: AxiosHeaders;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiRequestOptions extends AxiosRequestConfig {
  baseURL?: string;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
  requireAuth?: boolean;
  /**
   * When true, a 401 response from this specific request will NOT trigger the
   * global logout/redirect handler.
   *
   * Use this for requests that are intentionally made on public pages where
   * the user may not be authenticated — e.g. the initial session probe in
   * AuthProvider.checkAuth(). Without this flag, visiting /reset-password or
   * /verify-email would fire the global redirect-to-login on every page load.
   */
  _skipUnauthorizedHandler?: boolean;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRY = 2;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

export class HttpClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string, defaultOptions: ApiRequestOptions = {}) {
    this.baseURL = baseURL;

    this.axiosInstance = axios.create({
      baseURL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include cookies for auth
      ...defaultOptions,
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error: AxiosError) => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log(`✅ ${response.status} ${response.config.url}`, {
            data: response.data,
          });
        }
        return response;
      },
      (error: AxiosError) => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('❌ Response Error:', {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          });
        }

        // Handle 401 Unauthorized responses
        if (error.response?.status === 401) {
          // Only fire the global logout handler for genuine session-level 401s
          // (expired token, missing token, revoked token).
          //
          // Two classes of requests must NOT trigger the global redirect:
          //
          //   1. Domain-level 401s (wrong TOTP code, wrong password, etc.) —
          //      the calling component shows an inline error. Codes are in
          //      INLINE_AUTH_ERROR_CODES in `lib/error-codes.ts`.
          //
          //   2. Requests with `_skipUnauthorizedHandler: true` — used by the
          //      initial session probe (checkAuth) which runs on every page,
          //      including public pages like /reset-password and /verify-email.
          //      Without this flag those pages immediately redirect to /login.
          const responseCode = (
            error.response.data as { error?: { code?: string } }
          )?.error?.code;

          const skipGlobal =
            (error.config as ApiRequestOptions)?._skipUnauthorizedHandler ===
            true;

          if (
            !skipGlobal &&
            !INLINE_AUTH_ERROR_CODES.has(responseCode ?? '') &&
            onUnauthorized
          ) {
            onUnauthorized();
          }
        }

        if (error.response) {
          const status = error.response.status;
          const backendError = this.parseBackendError(error.response.data);
          throw createAppropriateError(status, backendError);
        }

        if (error.code === 'ECONNABORTED') {
          throw new TimeoutError();
        }

        if (error.code === 'ERR_NETWORK') {
          throw new NetworkError('Network error', error);
        }

        throw new NetworkError('Unknown error', error);
      }
    );
  }

  private async requestWithRetry<T>(
    config: AxiosRequestConfig,
    retryCount: number = DEFAULT_RETRY,
    retryDelay: number = DEFAULT_RETRY_DELAY,
    attempt: number = 1
  ): Promise<AxiosResponse<SuccessResponse<T>>> {
    try {
      const response =
        await this.axiosInstance.request<SuccessResponse<T>>(config);
      return response;
    } catch (error) {
      const axiosError = error as AxiosError;

      // Don't retry on client errors (4xx).
      // 429 (Too Many Requests) must NOT be retried — retrying a rate-limited
      // request immediately makes the problem worse and creates a flood cascade.
      if (
        axiosError.response &&
        axiosError.response.status >= 400 &&
        axiosError.response.status < 500
      ) {
        throw error;
      }

      // Retry logic
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.requestWithRetry(
          config,
          retryCount,
          retryDelay,
          attempt + 1
        );
      }

      throw error;
    }
  }

  private parseBackendError(data: unknown): BackendErrorResponse | undefined {
    if (!data || typeof data !== 'object') {
      return undefined;
    }

    const payload = data as {
      success?: boolean;
      error?: {
        code?: string;
        type?: string;
        message?: string;
        // New format: array of field errors for validation failures.
        // Old format (kept for compat): object with documentation_url etc.
        details?: unknown;
        documentation_url?: string;
      };
      meta?: {
        request_id?: string;
        timestamp?: string;
        api_version?: string;
        path?: string;
        status?: number;
      };
    };

    if (payload.success !== false || !payload.error) {
      return undefined;
    }

    const rawDetails = payload.error.details;

    // ── New format: details is an array of { field, message, code } ──────────
    const fieldErrors: import('./errors').FieldError[] = Array.isArray(
      rawDetails
    )
      ? (rawDetails as import('./errors').FieldError[])
      : [];

    // ── Build a flat field→message map for easy form library integration ─────
    const fields: Record<string, string> = {};
    for (const fe of fieldErrors) {
      if (fe.field) fields[fe.field] = fe.message;
    }

    // ── documentation_url: check error level, then legacy details object ─────
    const detailsObj =
      !Array.isArray(rawDetails) &&
      typeof rawDetails === 'object' &&
      rawDetails !== null
        ? (rawDetails as Record<string, unknown>)
        : {};

    const documentationUrl =
      (typeof payload.error.documentation_url === 'string'
        ? payload.error.documentation_url
        : undefined) ??
      (typeof detailsObj.documentation_url === 'string'
        ? detailsObj.documentation_url
        : undefined) ??
      'https://docs.postengage.ai/errors';

    const details: ErrorResponseDetails = {
      documentation_url: documentationUrl,
      fields: Object.keys(fields).length > 0 ? fields : undefined,
      action: detailsObj.action as string | undefined,
      support_reference: detailsObj.support_reference as string | undefined,
      // Include meta for traceability
      request_id: payload.meta?.request_id,
      api_version: payload.meta?.api_version,
      path: payload.meta?.path,
      status: payload.meta?.status,
    };

    return {
      message: payload.error.message ?? 'An unexpected error occurred',
      code: payload.error.code ?? ErrorCodes.INTERNAL.UNEXPECTED,
      type: payload.error.type,
      fieldErrors: fieldErrors.length > 0 ? fieldErrors : undefined,
      details,
      timestamp: payload.meta?.timestamp ?? new Date().toISOString(),
    };
  }

  private transformResponse<T>(
    axiosResponse: AxiosResponse<SuccessResponse<T>>
  ): ApiSuccessResponse<T> {
    return {
      data: axiosResponse.data,
      error: null,
      status: axiosResponse.status,
      headers: axiosResponse.headers as AxiosHeaders,
    };
  }

  async request<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      retry = DEFAULT_RETRY,
      retryDelay = DEFAULT_RETRY_DELAY,
      ...axiosConfig
    } = options;

    const config: AxiosRequestConfig = {
      url: endpoint,
      ...axiosConfig,
    };

    try {
      const response = await this.requestWithRetry<T>(
        config,
        retry,
        retryDelay
      );
      return this.transformResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const backendError = this.parseBackendError(error.response.data);
          throw createAppropriateError(status, backendError);
        }

        if (error.code === 'ECONNABORTED') {
          throw new TimeoutError();
        }

        if (error.code === 'ERR_NETWORK') {
          throw new NetworkError('Network error', error);
        }
      }

      throw new NetworkError('Unknown error', error);
    }
  }

  async get<T>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', data });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', data });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', data });
  }

  async delete<T>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Default HTTP client instance
export const httpClient = new HttpClient(
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
);
