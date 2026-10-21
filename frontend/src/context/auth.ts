import { createContext, useContext } from 'react';
import type { AuthUser, ErrorCode, LoginRequest } from '../api/types';

export interface Session {
  token: string;
  user: AuthUser;
  /** Epoch en ms en que expira el token. */
  expiresAt: number;
}

export interface AuthContextValue {
  session: Session | null;
  login: (credentials: LoginRequest) => Promise<void>;
  /** Cierra la sesión. Con `reason`, la pantalla de login muestra el motivo. */
  logout: (reason?: ErrorCode) => void;
  /** Motivo del último cierre de sesión forzado (ej. TOKEN_EXPIRED). */
  logoutReason: ErrorCode | null;
  clearLogoutReason: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return value;
};
