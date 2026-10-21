import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth';
import styles from './SessionExpiryNotice.module.css';

/** Se avisa con esta anticipación; el API no tiene refresh token. */
const WARNING_MS = 2 * 60 * 1000;

const formatRemaining = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

/** Aviso previo a la expiración del token, para que el cierre no tome por sorpresa. */
export function SessionExpiryNotice() {
  const { session, logout } = useAuth();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!session) return null;
  const remaining = session.expiresAt - now;
  if (remaining > WARNING_MS || remaining <= 0) return null;

  return (
    <div className={styles.notice} role="status">
      <p>
        Tu sesión expira en <strong className={styles.time}>{formatRemaining(remaining)}</strong>.
        Por seguridad tendrás que volver a ingresar.
      </p>
      <button type="button" className={styles.action} onClick={() => logout()}>
        Ingresar de nuevo ahora
      </button>
    </div>
  );
}
