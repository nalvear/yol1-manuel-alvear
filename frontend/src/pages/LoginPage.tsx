import { LoginForm } from '../components/auth/LoginForm';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/auth';
import { messageForCode } from '../utils/messages';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { logoutReason, clearLogoutReason } = useAuth();
  const notice = logoutReason ? messageForCode(logoutReason) : null;

  return (
    <AuthLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h2 className={styles.title}>Ingresa a tu cuenta</h2>
          <p className={styles.subtitle}>Usa tus credenciales para consultar scores.</p>
        </header>

        {notice && (
          <Alert tone={notice.tone} title={notice.title} onDismiss={clearLogoutReason}>
            {notice.description}
          </Alert>
        )}

        <LoginForm />
      </div>
    </AuthLayout>
  );
}
