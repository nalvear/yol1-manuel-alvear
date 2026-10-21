import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import { parseRut } from '../utils/rut.js';

/** Valida `:rut` (formato + dígito verificador) y deja el RUT normalizado en `res.locals.rut`. */
export const validateRutParam: RequestHandler = (req, res, next) => {
  const param = req.params.rut;
  const rut = typeof param === 'string' ? parseRut(param) : null;
  if (!rut) {
    throw AppError.invalidRut();
  }

  res.locals.rut = rut;
  next();
};
