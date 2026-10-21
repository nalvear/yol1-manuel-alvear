import type { ReactNode } from 'react';
import type { UserMessage } from '../../utils/messages';
import styles from './Alert.module.css';

interface AlertProps {
  tone: UserMessage['tone'] | 'success';
  title: string;
  children?: ReactNode;
  onDismiss?: () => void;
}

const ICONS: Record<AlertProps['tone'], string> = {
  danger: '!',
  warning: '!',
  info: 'i',
  success: '✓',
};

/**
 * Mensaje en línea. Los errores usan role="alert" para que se anuncien de
 * inmediato; el resto, role="status".
 */
export function Alert({ tone, title, children, onDismiss }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[tone]}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <span className={styles.icon} aria-hidden="true">
        {ICONS[tone]}
      </span>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {children && <div className={styles.description}>{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Cerrar mensaje">
          ×
        </button>
      )}
    </div>
  );
}
