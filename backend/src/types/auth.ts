export type Role = 'admin' | 'user';

/** Claims propios del JWT (ver `JwtPayload` en openapi.yaml). `rut` solo existe para `user`. */
export type TokenClaims = { sub: string; role: 'user'; rut: string } | { sub: string; role: 'admin' };

/** Datos públicos del usuario autenticado (ver `AuthUser` en openapi.yaml). */
export type AuthUser = { id: string; role: 'user'; rut: string } | { id: string; role: 'admin' };
