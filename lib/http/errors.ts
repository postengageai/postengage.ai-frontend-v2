// ─── Backend error response shape ────────────────────────────────────────────
// Mirrors PostEngageErrorResponse from @app/errors in the backend.

import { ErrorCodes } from '../error-codes';

/** One field-level validation failure (present when code === 'PE-VAL-001'). */
export interface FieldError {
  field: string;
  message: string;
  code: string;
}

export interface ErrorResponseDetails {
  documentation_url: string;
  /** Field-level validation errors, keyed by field name. */
  fields?: Record<string, string>;
  action?: string;
  support_reference?: string;
  [key: string]: unknown;
}

export interface BackendErrorResponse {
  message: string;
  /** PE-DOMAIN-SEQ code, e.g. "PE-VAL-001", "PE-AUTH-001" */
  code: string;
  /** error.type from the backend, e.g. "validation_error" */
  type?: string;
  /** Field-level errors — present only for validation failures */
  fieldErrors?: FieldError[];
  details: ErrorResponseDetails;
  timestamp: string;
}

// Base error class
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  /** error.type from backend, e.g. "validation_error", "authentication_error" */
  public readonly type?: string;
  /** Field-level errors — populated for PE-VAL-001 validation failures */
  public readonly fieldErrors?: FieldError[];
  public readonly details?: ErrorResponseDetails;
  public readonly timestamp: string;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    details?: ErrorResponseDetails,
    type?: string,
    fieldErrors?: FieldError[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.type = type;
    this.fieldErrors = fieldErrors;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  /** True when this error carries field-level validation details. */
  get isValidationError(): boolean {
    return (
      this.code === ErrorCodes.VALIDATION.INVALID_INPUT ||
      this.type === 'validation_error'
    );
  }

  /**
   * Returns a flat { fieldName: errorMessage } map — perfect for
   * react-hook-form's setError() or similar form libraries.
   *
   * @example
   * const fields = error.getFieldErrors();
   * Object.entries(fields).forEach(([field, msg]) => setError(field, { message: msg }));
   */
  getFieldErrors(): Record<string, string> {
    return this.details?.fields ?? {};
  }

  // Factory method to create ApiError from backend response
  static fromBackendResponse(
    statusCode: number,
    errorResponse: BackendErrorResponse
  ): ApiError {
    return new ApiError(
      statusCode,
      errorResponse.message,
      errorResponse.code,
      errorResponse.details,
      errorResponse.type,
      errorResponse.fieldErrors
    );
  }

  // Factory method to create ApiError from network/unknown errors
  static fromNetworkError(
    statusCode: number,
    message: string,
    originalError?: unknown
  ): ApiError {
    return new ApiError(statusCode, message, undefined, {
      documentation_url: 'https://docs.postengage.ai/errors',
      originalError:
        originalError instanceof Error
          ? { name: originalError.name, message: originalError.message }
          : originalError,
    });
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      statusCode: this.statusCode,
      name: this.name,
    };
  }
}

// Specific error types for better categorization
export class ClientError extends ApiError {
  constructor(
    statusCode: number,
    message: string,
    code?: string,
    details?: ErrorResponseDetails
  ) {
    super(statusCode, message, code, details);
    this.name = 'ClientError';
  }
}

export class ServerError extends ApiError {
  constructor(
    statusCode: number,
    message: string,
    code?: string,
    details?: ErrorResponseDetails
  ) {
    super(statusCode, message, code, details);
    this.name = 'ServerError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string, originalError?: unknown) {
    super(0, message, undefined, {
      documentation_url: 'https://docs.postengage.ai/errors',
      originalError:
        originalError instanceof Error
          ? { name: originalError.name, message: originalError.message }
          : originalError,
    });
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor() {
    super(408, 'Request timeout', undefined, {
      documentation_url: 'https://docs.postengage.ai/errors',
      action: 'retry_request',
    });
    this.name = 'TimeoutError';
  }
}

// Utility function to check if error is an ApiError
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// Utility function to check if error is from backend
export function isBackendError(error: unknown): error is ApiError {
  return isApiError(error) && error.code !== undefined;
}

// Utility function to create appropriate error type based on status code
export function createAppropriateError(
  statusCode: number,
  errorResponse?: BackendErrorResponse
): ApiError {
  if (errorResponse) {
    return ApiError.fromBackendResponse(statusCode, errorResponse);
  }

  if (statusCode >= 400 && statusCode < 500) {
    return new ClientError(
      statusCode,
      `Client error: ${statusCode}`,
      undefined,
      { documentation_url: 'https://docs.postengage.ai/errors' }
    );
  }

  if (statusCode >= 500) {
    return new ServerError(
      statusCode,
      `Server error: ${statusCode}`,
      undefined,
      { documentation_url: 'https://docs.postengage.ai/errors' }
    );
  }

  return ApiError.fromNetworkError(statusCode, `Unknown error: ${statusCode}`);
}

// ─── parseApiError ────────────────────────────────────────────────────────────
// Single utility for components to convert any caught error into a displayable
// shape without importing getTitleForCode + isApiError separately.

export interface ParsedApiError {
  /** Short display title for toast headers / error banners (e.g. "Invalid credentials") */
  title: string;
  /**
   * The human-friendly message to show the user.
   * Comes directly from the backend `error.message` field so there is no
   * duplication or drift between frontend and backend copy.
   */
  message: string;
  /**
   * Field → message map for validation errors.
   * Use with react-hook-form: Object.entries(fields).forEach(([f,m]) => setError(f, {message:m}))
   */
  fields: Record<string, string>;
  /** Raw PE-* code if available — useful for conditional branching logic */
  code: string | undefined;
}

/**
 * Converts any caught error into a `ParsedApiError` that is safe to show.
 *
 * The `message` is taken directly from the backend response — we do NOT
 * maintain a duplicate frontend copy of error messages.  Only `title`
 * (a short display header not sent by the API) is derived from the code.
 */
export function parseApiError(
  error: unknown,
  fallback: { title?: string; message?: string } = {}
): ParsedApiError {
  if (error instanceof ApiError) {
    // Lazy import to avoid a circular dep at module init time.
    const { getTitleForCode } = require('../auth-errors') as {
      getTitleForCode: (code: string | undefined) => string;
    };

    return {
      title: getTitleForCode(error.code),
      // Use the backend's own message — no frontend override.
      message:
        error.message && error.message !== ''
          ? error.message
          : 'An unexpected error occurred. Please try again.',
      fields: error.getFieldErrors(),
      code: error.code,
    };
  }

  return {
    title: fallback.title ?? 'Something went wrong',
    message:
      fallback.message ??
      (error instanceof Error
        ? error.message
        : 'An unexpected error occurred. Please try again.'),
    fields: {},
    code: undefined,
  };
}
