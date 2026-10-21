import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';

/** Errores de body-parser (express.json): traen `type` y un status 4xx. */
interface BodyParserError extends Error {
  type: string;
  status: number;
}

const isBodyParserError = (err: unknown): err is BodyParserError =>
  err instanceof Error &&
  typeof (err as Partial<BodyParserError>).type === 'string' &&
  typeof (err as Partial<BodyParserError>).status === 'number';

const toAppError = (err: unknown): AppError => {
  if (err instanceof AppError) return err;

  if (isBodyParserError(err) && err.status >= 400 && err.status < 500) {
    const message =
      err.type === 'entity.parse.failed'
        ? 'El cuerpo de la petición no es un JSON válido.'
        : 'El cuerpo de la petición no es válido.';
    return new AppError(err.status, 'VALIDATION_ERROR', message);
  }

  return AppError.internal();
};

/**
 * Traduce cualquier error al formato `{ error: { code, message } }` del contrato.
 * Los errores inesperados se registran y se responden como 500 sin filtrar detalles.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const appError = toAppError(err);

  if (appError.status >= 500) {
    console.error(err);
  }

  if (appError.headers) {
    res.set(appError.headers);
  }

  res.status(appError.status).json(appError.toBody());
};
