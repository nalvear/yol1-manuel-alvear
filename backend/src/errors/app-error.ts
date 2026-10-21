/** Códigos estables definidos en `components.schemas.Error` de openapi.yaml. */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_RUT'
  | 'MISSING_TOKEN'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN_RUT'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetail[];
  };
}

interface AppErrorOptions {
  details?: ErrorDetail[];
  headers?: Record<string, string>;
}

/**
 * Error de dominio con status HTTP y código estable. Todo lo que no sea AppError
 * se considera inesperado y el middleware lo responde como 500.
 */
export class AppError extends Error {
  readonly details?: ErrorDetail[];
  readonly headers?: Record<string, string>;

  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    options: AppErrorOptions = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.details = options.details;
    this.headers = options.headers;
  }

  toBody(): ErrorBody {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }

  static validation(message: string, details?: ErrorDetail[]) {
    return new AppError(400, 'VALIDATION_ERROR', message, { details });
  }

  static invalidRut() {
    return new AppError(400, 'INVALID_RUT', 'El RUT ingresado no es válido.');
  }

  static invalidCredentials() {
    return new AppError(401, 'INVALID_CREDENTIALS', 'Usuario o contraseña incorrectos.');
  }

  static missingToken() {
    return new AppError(401, 'MISSING_TOKEN', 'Se requiere un token de autenticación.', {
      headers: { 'WWW-Authenticate': 'Bearer' },
    });
  }

  static invalidToken() {
    return new AppError(401, 'INVALID_TOKEN', 'El token no es válido.', {
      headers: { 'WWW-Authenticate': 'Bearer error="invalid_token"' },
    });
  }

  static tokenExpired() {
    return new AppError(401, 'TOKEN_EXPIRED', 'La sesión expiró, inicia sesión nuevamente.', {
      headers: {
        'WWW-Authenticate': 'Bearer error="invalid_token", error_description="Token expirado"',
      },
    });
  }

  static forbiddenRut() {
    return new AppError(403, 'FORBIDDEN_RUT', 'No tienes permiso para consultar este RUT.');
  }

  static notFound(message = 'Recurso no encontrado.') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static internal() {
    return new AppError(500, 'INTERNAL_ERROR', 'Ocurrió un error inesperado.');
  }
}
