import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setUnauthorizedHandler } from '../api/client';
import { login as loginRequest } from '../api/endpoints';
import type { ErrorCode, LoginRequest } from '../api/types';
import { AuthContext, type AuthContextValue, type Session } from './auth';

/**
 * La sesión se guarda en sessionStorage: sobrevive a un refresh pero se borra al
 * cerrar la pestaña. Una cookie httpOnly sería más segura frente a XSS, pero
 * requiere cambiar el contrato del API (fuera del alcance del MVP).
 */
const STORAGE_KEY = 'riesgo-financiero.session';

const readStoredSession = (): Session | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
};

const storeSession = (session: Session | null) => {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage no disponible (modo privado, bloqueado): la sesión vive solo en memoria.
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readStoredSession);
  const [logoutReason, setLogoutReason] = useState<ErrorCode | null>(null);

  const logout = useCallback((reason?: ErrorCode) => {
    storeSession(null);
    setSession(null);
    setLogoutReason(reason ?? null);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await loginRequest(credentials);
    const next: Session = {
      token: response.token,
      user: response.user,
      expiresAt: Date.now() + response.expiresIn * 1000,
    };
    storeSession(next);
    setLogoutReason(null);
    setSession(next);
  }, []);

  // Un 401 de token en cualquier llamada cierra la sesión con su motivo.
  useEffect(() => {
    setUnauthorizedHandler((error) => logout(error.code));
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Cierra la sesión al vencer el token, sin esperar a que falle una llamada.
  useEffect(() => {
    if (!session) return;
    const remaining = session.expiresAt - Date.now();
    const timer = window.setTimeout(() => logout('TOKEN_EXPIRED'), Math.max(remaining, 0));
    return () => window.clearTimeout(timer);
  }, [session, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      login,
      logout,
      logoutReason,
      clearLogoutReason: () => setLogoutReason(null),
    }),
    [session, login, logout, logoutReason],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
