import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import { JWT_ALGORITHM } from '../services/auth.service.js';
import type { TokenClaims } from '../types/auth.js';
import { parseRut } from '../utils/rut.js';

const BEARER = /^Bearer\s+(\S+)$/i;

/**
 * Acepta solo los claims que emite `POST /login`: un token con firma válida pero
 * forma inesperada (rol desconocido, `user` sin RUT válido, `admin` con RUT) se
 * trata como inválido.
 */
const toTokenClaims = (payload: string | jwt.JwtPayload): TokenClaims | null => {
  if (typeof payload === 'string' || typeof payload.sub !== 'string') return null;

  if (payload.role === 'user' && typeof payload.rut === 'string') {
    const rut = parseRut(payload.rut);
    return rut ? { sub: payload.sub, role: 'user', rut } : null;
  }
  if (payload.role === 'admin' && payload.rut === undefined) {
    return { sub: payload.sub, role: 'admin' };
  }
  return null;
};

/** Verifica `Authorization: Bearer <token>` y deja los claims en `req.auth`. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const token = BEARER.exec(req.get('Authorization') ?? '')?.[1];
  if (!token) {
    throw AppError.missingToken();
  }

  let payload: string | jwt.JwtPayload;
  try {
    // Fijar el algoritmo evita aceptar tokens `alg: none` o firmados con otro esquema.
    payload = jwt.verify(token, env.jwtSecret, { algorithms: [JWT_ALGORITHM] });
  } catch (err) {
    throw err instanceof jwt.TokenExpiredError ? AppError.tokenExpired() : AppError.invalidToken();
  }

  const claims = toTokenClaims(payload);
  if (!claims) {
    throw AppError.invalidToken();
  }

  req.auth = claims;
  next();
};
