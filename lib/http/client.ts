export interface SuccessResponse<T = unknown> {
  data: T;
  meta: {
    success: boolean;
    status: number;
    timestamp: string;
    path: string;
    trace_id?: string;
  };
}

// Backend error response structure
export interface ErrorResponse {
  message: string;
  code: string;
  details: {
    documentation_url: string;
    action?: string;
    support_reference?: string;
    [key: string]: unknown;
  };
  timestamp: string;
}

// Import error handling utilities
import {
  ApiError,
  TimeoutError,
  NetworkError,
  createAppropriateError
} from './errors';


export interface ApiSuccessResponse<T = unknown> {
  data: T;
  error: null;
  status: number;
  headers: Headers;
  raw: SuccessResponse<T>;
}

export interface ApiErrorResponse {
  data: null;
  error: ErrorResponse;
  status: number;
  headers: Headers;
  raw: ErrorResponse;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiRequestOptions extends RequestInit {
  baseURL?: string;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
  requireAuth?: boolean;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRY = 2;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

export class HttpClient {
  private baseURL: string;
  private defaultOptions: ApiRequestOptions;

  constructor(baseURL: string, defaultOptions: ApiRequestOptions = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      timeout: DEFAULT_TIMEOUT,
      retry: DEFAULT_RETRY,
      retryDelay: DEFAULT_RETRY_DELAY,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for auth
      ...defaultOptions,
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let rawData: unknown = {};

    if (contentType?.includes('application/json')) {
      try {
        rawData = await response.json();
      } catch {
        rawData = {};
      }
    }

    if (!response.ok) {
      // Handle backend error response format
      const errorResponse = rawData as ErrorResponse;
      throw createAppropriateError(
        response.status,
        errorResponse
      );
    }

    // Handle backend success response format
    const successResponse = rawData as SuccessResponse<T>;

    return {
      data: successResponse.data,
      error: null,
      status: response.status,
      headers: response.headers,
      raw: successResponse,
    };
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new TimeoutError()), ms);
    });
  }

  private async requestWithRetry<T>(
    url: string,
    options: ApiRequestOptions,
    attempt = 1
  ): Promise<ApiResponse<T>> {
    const timeoutMs = options.timeout ?? DEFAULT_TIMEOUT;
    const retryCount = options.retry ?? DEFAULT_RETRY;
    const retryDelayMs = options.retryDelay ?? DEFAULT_RETRY_DELAY;

    const {
      timeout: _,
      retry: __,
      retryDelay: ___,
      ...requestOptions
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error:any) {
      clearTimeout(timeoutId);

      // Don't retry on auth errors or client errors (4xx)
      if (
        error.statusCode >= 400 &&
        error.statusCode < 500
      ) {
        throw error;
      }

      // Don't retry on abort errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError();
      }

      // Retry logic
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        return this.requestWithRetry(url, options, attempt + 1);
      }

      throw new NetworkError('Network error', error);
    }
  }

  async request<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const mergedOptions: ApiRequestOptions = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
      },
    };

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseURL}${endpoint}`;

    try {
      return await this.requestWithRetry<T>(url, mergedOptions);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
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
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
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
