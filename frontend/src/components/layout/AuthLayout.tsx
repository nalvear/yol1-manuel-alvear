import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';
import { Wordmark } from './Wordmark';

/** Pantalla dividida: mensaje de marca en verde a la izquierda, formulario a la derecha. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <section className={styles.hero}>
        <Wordmark />
        <div className={styles.heroCopy}>
          <h1 className={styles.title}>
            Conoce el riesgo <span className={styles.accent}>antes de decidir</span>
          </h1>
          <p className={styles.lead}>
            Consulta el score financiero de personas y empresas por RUT, con acceso según tu perfil
            y registro de cada consulta.
          </p>
        </div>
        <ul className={styles.points}>
          <li>Acceso por perfil</li>
          <li>Sesiones con expiración</li>
          <li>Consultas trazables</li>
        </ul>
      </section>
      <main className={styles.panel}>
        <div className={styles.panelInner}>{children}</div>
      </main>
    </div>
  );
}
