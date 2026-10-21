import { describe, expect, it } from 'vitest';
import {
  computeDv,
  formatRut,
  isSameRut,
  isValidRut,
  normalizeRut,
  parseRut,
} from '../src/utils/rut.js';

describe('computeDv', () => {
  it.each([
    ['12345678', '5'],
    ['11111111', '1'],
    ['9876543', '3'],
    ['10000013', 'K'],
    ['10000004', '0'],
  ])('%s → %s', (body, dv) => {
    expect(computeDv(body)).toBe(dv);
  });
});

describe('normalizeRut', () => {
  it('quita puntos, guion y espacios y pasa la K a mayúscula', () => {
    expect(normalizeRut(' 10.000.013-k ')).toBe('10000013K');
  });

  it('elimina ceros a la izquierda', () => {
    expect(normalizeRut('09.876.543-3')).toBe('98765433');
  });
});

describe('parseRut / isValidRut', () => {
  it.each(['12.345.678-5', '12345678-5', '123456785', '9.876.543-3', '10.000.013-k', '10000013K'])(
    'acepta %s',
    (rut) => {
      expect(isValidRut(rut)).toBe(true);
    },
  );

  it('devuelve el RUT normalizado', () => {
    expect(parseRut('12.345.678-5')).toBe('123456785');
  });

  it.each([
    ['12.345.678-9', 'dígito verificador incorrecto (ejemplo del enunciado)'],
    ['12.345.678-K', 'K donde no corresponde'],
    ['12.34.5678-5', 'puntos mal ubicados'],
    ['123456-0', 'cuerpo demasiado corto'],
    ['123.456.789-0', 'cuerpo demasiado largo'],
    ['abc', 'texto'],
    ['', 'vacío'],
    ['12.345.678--5', 'doble guion'],
  ])('rechaza %s (%s)', (rut) => {
    expect(isValidRut(rut)).toBe(false);
    expect(parseRut(rut)).toBeNull();
  });
});

describe('formatRut', () => {
  it.each([
    ['123456785', '12.345.678-5'],
    ['98765433', '9.876.543-3'],
    ['10000013k', '10.000.013-K'],
    ['12.345.678-5', '12.345.678-5'],
  ])('%s → %s', (input, expected) => {
    expect(formatRut(input)).toBe(expected);
  });
});

describe('isSameRut', () => {
  it('ignora el formato', () => {
    expect(isSameRut('12.345.678-5', '123456785')).toBe(true);
    expect(isSameRut('10.000.013-k', '10000013K')).toBe(true);
  });

  it('distingue RUTs distintos', () => {
    expect(isSameRut('12.345.678-5', '11.111.111-1')).toBe(false);
  });
});
