import { forwardRef } from 'react';
import type { ScoreResponse } from '../../api/types';
import { formatDateTime, SCORE_BANDS, scoreBand } from '../../utils/score';
import styles from './ScoreResult.module.css';

/** Resultado de una consulta: score, tramo de riesgo y fecha de la consulta. */
export const ScoreResult = forwardRef<HTMLHeadingElement, { result: ScoreResponse }>(
  function ScoreResult({ result }, headingRef) {
    const band = scoreBand(result.score);
    const info = SCORE_BANDS[band];

    return (
      <article className={`${styles.card} ${styles[band]}`} aria-labelledby="score-result-title">
        <header className={styles.header}>
          <p className={styles.eyebrow}>Resultado</p>
          <h2 id="score-result-title" ref={headingRef} tabIndex={-1} className={styles.rut}>
            RUT {result.rut}
          </h2>
        </header>

        <div className={styles.scoreRow}>
          <p className={styles.score}>
            <span className={styles.scoreValue}>{result.score}</span>
            <span className={styles.scoreMax}>/100</span>
          </p>
          <div className={styles.bandInfo}>
            <span className={styles.bandBadge}>{info.label}</span>
            <p className={styles.bandDescription}>{info.description}</p>
          </div>
        </div>

        <div
          className={styles.gauge}
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={result.score}
          aria-valuetext={`${result.score} de 100, ${info.label.toLowerCase()}`}
        >
          <div className={styles.track}>
            <span className={styles.marker} style={{ left: `${result.score}%` }} aria-hidden="true" />
          </div>
          <div className={styles.scale} aria-hidden="true">
            <span>0</span>
            <span>40</span>
            <span>70</span>
            <span>100</span>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>
            Consultado el <time dateTime={result.fecha}>{formatDateTime(result.fecha)}</time>
          </p>
          <p className={styles.note}>Escala 0–100: a mayor score, menor riesgo.</p>
        </footer>
      </article>
    );
  },
);
