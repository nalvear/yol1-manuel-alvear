import styles from './Wordmark.module.css';

/** Marca del producto (no usa el logo de YOL1, solo su lenguaje visual). */
export function Wordmark({ onDark = true }: { onDark?: boolean }) {
  return (
    <span className={`${styles.wordmark} ${onDark ? styles.onDark : styles.onLight}`}>
      <span className={styles.mark} aria-hidden="true" />
      <span>
        Riesgo<span className={styles.suffix}> Financiero</span>
      </span>
    </span>
  );
}
