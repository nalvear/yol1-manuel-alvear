import { createHash } from 'node:crypto';
import { formatRut, normalizeRut } from '../utils/rut.js';

export interface ScoreResult {
  rut: string;
  score: number;
  fecha: string;
}

const MAX_SCORE = 100;

/**
 * Score determinista entre 0 y 100: SHA-256 del RUT normalizado, primeros 4 bytes
 * como entero sin signo, módulo 101. El mismo RUT siempre da el mismo valor sin
 * importar su formato, y el hash reparte RUTs consecutivos de forma uniforme.
 */
export const calculateScore = (rut: string): number => {
  const digest = createHash('sha256').update(normalizeRut(rut)).digest();
  return digest.readUInt32BE(0) % (MAX_SCORE + 1);
};

/** Respuesta de `GET /score/{rut}`. Se asume que el RUT ya fue validado. */
export const getScore = (rut: string, now: Date = new Date()): ScoreResult => ({
  rut: formatRut(rut),
  score: calculateScore(rut),
  fecha: now.toISOString(),
});
