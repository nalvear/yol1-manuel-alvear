import { describe, expect, it } from 'vitest';
import { calculateScore, getScore } from '../src/services/score.service.js';
import { computeDv } from '../src/utils/rut.js';

/** Genera N RUTs válidos consecutivos a partir de un cuerpo inicial. */
const sampleRuts = (count: number, start = 10_000_000) =>
  Array.from({ length: count }, (_, i) => {
    const body = String(start + i);
    return `${body}${computeDv(body)}`;
  });

describe('calculateScore', () => {
  it('es determinista para el mismo RUT', () => {
    const first = calculateScore('12.345.678-5');
    for (let i = 0; i < 5; i++) {
      expect(calculateScore('12.345.678-5')).toBe(first);
    }
  });

  it('no depende del formato del RUT', () => {
    const expected = calculateScore('123456785');
    expect(calculateScore('12.345.678-5')).toBe(expected);
    expect(calculateScore('12345678-5')).toBe(expected);
  });

  it('siempre está entre 0 y 100 y es entero', () => {
    for (const rut of sampleRuts(1000)) {
      const score = calculateScore(rut);
      expect(Number.isInteger(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('varía entre RUTs distintos', () => {
    const scores = new Set(sampleRuts(200).map(calculateScore));
    // Con 101 valores posibles, 200 RUTs deberían cubrir buena parte del rango.
    expect(scores.size).toBeGreaterThan(50);
  });
});

describe('getScore', () => {
  it('devuelve el RUT formateado, el score y la fecha de la consulta', () => {
    const now = new Date('2025-06-27T14:35:00Z');
    expect(getScore('123456785', now)).toEqual({
      rut: '12.345.678-5',
      score: calculateScore('123456785'),
      fecha: '2025-06-27T14:35:00.000Z',
    });
  });
});
