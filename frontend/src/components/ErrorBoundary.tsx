import { Component, type ErrorInfo, type ReactNode } from 'react';
import { messageForCode } from '../utils/messages';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import styles from './ErrorBoundary.module.css';

interface State {
  hasError: boolean;
}

/**
 * Último recurso ante un error de render: en vez de una pantalla en blanco,
 * muestra un mensaje y permite recargar.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error no controlado en la interfaz', error, info.componentStack);
  }

  override render() {
    if (!this.state.hasError) return this.props.children;

    const message = messageForCode('UNKNOWN_ERROR');
    return (
      <div className={styles.fallback}>
        <Alert tone="danger" title="La aplicación encontró un problema">
          {message.description}
        </Alert>
        <Button onClick={() => window.location.reload()}>Recargar la página</Button>
      </div>
    );
  }
}
