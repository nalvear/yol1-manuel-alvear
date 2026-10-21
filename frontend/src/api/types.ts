/** Tipos espejo de backend/openapi.yaml. */

export type Role = 'admin' | 'user';

export type AuthUser = { id: string; role: 'user'; rut: string } | { id: string; role: 'admin' };

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: 'Bearer';
  /** Segundos de validez del token. */
  expiresIn: number;
  user: AuthUser;
}

export interface ScoreResponse {
  rut: string;
  score: number;
  fecha: string;
}

/** Códigos del contrato. */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_RUT'
  | 'MISSING_TOKEN'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN_RUT'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

/** Códigos propios del cliente, para fallos que no llegan a ser una respuesta del API. */
export type ClientErrorCode = 'NETWORK_ERROR' | 'TIMEOUT' | 'UNKNOWN_ERROR';

export type ErrorCode = ApiErrorCode | ClientErrorCode;

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  error: { code: ApiErrorCode; message: string; details?: ErrorDetail[] };
}
