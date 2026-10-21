import type { ScoreResponse } from '../../api/types';
import { formatTime, SCORE_BANDS, scoreBand } from '../../utils/score';
import styles from './ScoreHistory.module.css';

interface ScoreHistoryProps {
  items: ScoreResponse[];
  activeFecha?: string;
  onSelect: (item: ScoreResponse) => void;
}

/** Consultas de esta sesión (solo en memoria), para revisarlas sin volver a consultar. */
export function ScoreHistory({ items, activeFecha, onSelect }: ScoreHistoryProps) {
  if (items.length === 0) return null;

  return (
    <section className={styles.history} aria-labelledby="history-title">
      <h2 id="history-title" className={styles.title}>
        Consultas de esta sesión
      </h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.fecha}>
            <button
              type="button"
              className={styles.item}
              onClick={() => onSelect(item)}
              aria-current={item.fecha === activeFecha || undefined}
            >
              <span className={styles.rut}>{item.rut}</span>
              <span className={`${styles.score} ${styles[scoreBand(item.score)]}`}>
                {item.score}
                <span className="visually-hidden">, {SCORE_BANDS[scoreBand(item.score)].label}</span>
              </span>
              <time className={styles.time} dateTime={item.fecha}>
                {formatTime(item.fecha)}
              </time>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
