import { AppError, type ErrorDetail } from '../errors/app-error.js';

export interface LoginBody {
  username: string;
  password: string;
}

/** Límites de `LoginRequest` en openapi.yaml. */
const FIELDS = { username: 100, password: 200 } as const;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Valida el body de `POST /login`; lanza `VALIDATION_ERROR` con el detalle por campo. */
export const parseLoginBody = (body: unknown): LoginBody => {
  if (!isPlainObject(body)) {
    throw AppError.validation('El cuerpo debe ser un objeto JSON con username y password.');
  }

  const details: ErrorDetail[] = [];

  for (const [field, maxLength] of Object.entries(FIELDS)) {
    const value = body[field];
    if (value === undefined || value === null || value === '') {
      details.push({ field, message: 'Requerido' });
    } else if (typeof value !== 'string') {
      details.push({ field, message: 'Debe ser texto' });
    } else if (value.length > maxLength) {
      details.push({ field, message: `Máximo ${maxLength} caracteres` });
    }
  }

  for (const field of Object.keys(body)) {
    if (!(field in FIELDS)) {
      details.push({ field, message: 'Campo no permitido' });
    }
  }

  if (details.length > 0) {
    throw AppError.validation('Los datos de inicio de sesión no son válidos.', details);
  }

  return { username: body.username as string, password: body.password as string };
};
