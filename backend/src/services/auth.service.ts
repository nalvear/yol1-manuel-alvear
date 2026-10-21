import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findUserByUsername, type MockUser } from '../data/users.mock.js';
import { AppError } from '../errors/app-error.js';
import type { AuthUser, TokenClaims } from '../types/auth.js';
import { formatRut } from '../utils/rut.js';
import { verifyPassword } from '../utils/password.js';

export const JWT_ALGORITHM = 'HS256';

export interface LoginResult {
  token: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthUser;
}

/**
 * Se verifica contra este hash cuando el usuario no existe, para que la respuesta
 * tarde lo mismo y no revele qué usernames son válidos.
 */
const DUMMY_HASH =
  'scrypt$c2e03087a2d8b36cf7cc8e400e5b1e96$93d1af0a2b91c5cca51a1f2bd85862cf8f0ec3be3eddcaad73e03428cbd415f1ef7b35a8665e2834f5a265b40190c0d2b25fb4501d4ab23b2f54f0d98aa7a50c';

const toClaims = (user: MockUser): TokenClaims =>
  user.role === 'user' && user.rut
    ? { sub: user.id, role: 'user', rut: user.rut }
    : { sub: user.id, role: 'admin' };

const toAuthUser = (claims: TokenClaims): AuthUser =>
  claims.role === 'user'
    ? { id: claims.sub, role: 'user', rut: formatRut(claims.rut) }
    : { id: claims.sub, role: 'admin' };

export const login = (username: string, password: string): LoginResult => {
  const user = findUserByUsername(username);
  const passwordOk = verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordOk) {
    throw AppError.invalidCredentials();
  }

  const claims = toClaims(user);
  const token = jwt.sign(claims, env.jwtSecret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: env.jwtExpiresIn,
  });

  return {
    token,
    tokenType: 'Bearer',
    expiresIn: env.jwtExpiresIn,
    user: toAuthUser(claims),
  };
};
