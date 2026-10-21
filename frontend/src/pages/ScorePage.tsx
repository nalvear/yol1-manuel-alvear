import { Card } from '../components/ui/Card';
import { useAuth } from '../context/auth';
import styles from './ScorePage.module.css';

export function ScorePage() {
  const { session } = useAuth();
  const isAdmin = session?.user.role === 'admin';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Consulta de score</h1>
        <p className={styles.subtitle}>
          {isAdmin
            ? 'Como administrador puedes consultar cualquier RUT.'
            : 'Puedes consultar el score del RUT asociado a tu cuenta.'}
        </p>
      </header>

      {/* El formulario de consulta y el resultado se implementan en la Fase 6. */}
      <Card tone="sand">
        <p>La consulta de score estará disponible aquí.</p>
      </Card>
    </div>
  );
}
