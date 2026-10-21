import { describe, expect, it } from 'vitest';
import { computeDv, formatRutInput, isSameRut, validateRut } from './rut';

describe('computeDv', () => {
  it.each([
    ['12345678', '5'],
    ['10000013', 'K'],
    ['10000004', '0'],
  ])('%s → %s', (body, dv) => expect(computeDv(body)).toBe(dv));
});

describe('formatRutInput', () => {
  it.each([
    ['1', '1'],
    ['12', '1-2'],
    ['123456785', '12.345.678-5'],
    ['12.345.678-5', '12.345.678-5'],
    ['9876543-3', '9.876.543-3'],
    ['10000013k', '10.000.013-K'],
    ['12a34b56c78-5', '12.345.678-5'],
    ['1234567890', '12.345.678-9'],
    ['12K345678', '1.234.567-8'],
  ])('"%s" → "%s"', (raw, expected) => expect(formatRutInput(raw)).toBe(expected));
});

describe('validateRut', () => {
  it('acepta un RUT válido y devuelve su forma normalizada', () => {
    expect(validateRut('12.345.678-5')).toEqual({ valid: true, normalized: '123456785' });
  });

  it.each([
    ['', 'empty'],
    ['   ', 'empty'],
    ['1.234', 'incomplete'],
    ['12.34.5678-5', 'format'],
    ['12.345.678-9', 'dv'],
  ])('"%s" → %s', (input, reason) => {
    expect(validateRut(input)).toEqual({ valid: false, reason });
  });
});

describe('isSameRut', () => {
  it('ignora el formato', () => {
    expect(isSameRut('12.345.678-5', '123456785')).toBe(true);
    expect(isSameRut('12.345.678-5', '11.111.111-1')).toBe(false);
  });
});
