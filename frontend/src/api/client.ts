import type { ApiErrorBody, ErrorCode, ErrorDetail } from './types';

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const TIMEOUT_MS = 10_000;

/** Errores 401 que invalidan la sesión actual (no incluye INVALID_CREDENTIALS del login). */
const SESSION_ERRORS = new Set<ErrorCode>(['MISSING_TOKEN', 'INVALID_TOKEN', 'TOKEN_EXPIRED']);

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isSessionError(): boolean {
    return SESSION_ERRORS.has(this.code);
  }
}

type UnauthorizedHandler = (error: ApiError) => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** El AuthContext se registra aquí para cerrar la sesión ante un 401 de token. */
export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  onUnauthorized = handler;
};

const isApiErrorBody = (value: unknown): value is ApiErrorBody =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as ApiErrorBody).error?.code === 'string';

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string | null;
}

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new ApiError(0, 'TIMEOUT', 'El servidor tardó demasiado en responder.');
    }
    throw new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor.');
  }

  const data: unknown = await response.json().catch(() => null);

  if (response.ok) {
    return data as T;
  }

  const error = isApiErrorBody(data)
    ? new ApiError(response.status, data.error.code, data.error.message, data.error.details)
    : new ApiError(response.status, 'UNKNOWN_ERROR', 'Respuesta inesperada del servidor.');

  if (error.isSessionError) {
    onUnauthorized?.(error);
  }
  throw error;
};
