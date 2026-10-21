import styles from './DemoCredentials.module.css';

/** Usuarios mock del backend (ver backend/src/data/users.mock.ts y README). */
const DEMO_USERS = [
  { username: 'admin', password: 'admin123', description: 'Administrador · cualquier RUT' },
  { username: 'usuario', password: 'usuario123', description: 'Usuario · RUT 12.345.678-5' },
  { username: 'usuario2', password: 'usuario123', description: 'Usuario · RUT 11.111.111-1' },
] as const;

interface DemoCredentialsProps {
  onSelect: (username: string, password: string) => void;
  disabled?: boolean;
}

/** Atajo para evaluar el MVP: completa el formulario con un usuario mock. */
export function DemoCredentials({ onSelect, disabled }: DemoCredentialsProps) {
  return (
    <details className={styles.demo}>
      <summary className={styles.summary}>Usuarios de prueba</summary>
      <ul className={styles.list}>
        {DEMO_USERS.map((user) => (
          <li key={user.username}>
            <button
              type="button"
              className={styles.option}
              onClick={() => onSelect(user.username, user.password)}
              disabled={disabled}
            >
              <span className={styles.username}>{user.username}</span>
              <span className={styles.description}>{user.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
