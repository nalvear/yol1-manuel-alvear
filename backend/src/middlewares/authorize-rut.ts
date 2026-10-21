import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import { isSameRut } from '../utils/rut.js';

/**
 * Reglas de autorización de `GET /score/{rut}`:
 * - `admin`: cualquier RUT.
 * - `user`: solo el RUT de su propio token.
 *
 * Requiere `authenticate` y `validateRutParam` antes en la cadena.
 */
export const authorizeRut: RequestHandler = (req, res, next) => {
  const { auth } = req;
  const { rut } = res.locals;

  if (!auth || !rut) {
    // Error de configuración de la ruta, no del cliente: se responde 500.
    throw new Error('authorizeRut requiere authenticate y validateRutParam antes');
  }

  if (auth.role === 'user' && !isSameRut(auth.rut, rut)) {
    throw AppError.forbiddenRut();
  }

  next();
};
