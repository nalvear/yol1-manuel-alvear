import { Outlet } from 'react-router';
import { useAuth } from '../../context/auth';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import styles from './AppShell.module.css';
import { SessionExpiryNotice } from './SessionExpiryNotice';
import { Wordmark } from './Wordmark';

const ROLE_LABEL = { admin: 'Administrador', user: 'Usuario' } as const;

/** Estructura de las vistas autenticadas: header con sesión + contenido. */
export function AppShell() {
  const { session, logout } = useAuth();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Wordmark />
          {session && (
            <div className={styles.session}>
              <div className={styles.identity}>
                <Badge tone="lime">{ROLE_LABEL[session.user.role]}</Badge>
                {session.user.role === 'user' && (
                  <span className={styles.rut}>RUT {session.user.rut}</span>
                )}
              </div>
              <Button
                variant="ghost-dark"
                className={styles.logout}
                onClick={() => logout()}
                aria-label="Cerrar sesión"
              >
                <span className={styles.labelLong}>Cerrar sesión</span>
                <span className={styles.labelShort}>Salir</span>
              </Button>
            </div>
          )}
        </div>
        <SessionExpiryNotice />
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>Consulta de Riesgo Financiero · Cada consulta queda registrada con fecha y hora.</p>
      </footer>
    </>
  );
}
