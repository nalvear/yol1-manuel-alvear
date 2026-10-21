/**
 * Utilidades para RUT chileno.
 *
 * Forma normalizada: cuerpo sin ceros a la izquierda + dígito verificador en
 * mayúscula, sin puntos ni guion (ej. `123456785`). Es la que se guarda en el
 * JWT y la que se usa para comparar RUTs.
 */

/** Mismo patrón que `components.parameters.Rut` en openapi.yaml. */
const RUT_FORMAT = /^\d{1,2}(\.?\d{3}){2}-?[\dkK]$/;

/** Calcula el dígito verificador (módulo 11) de un cuerpo numérico. */
export const computeDv = (body: string): string => {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const dv = 11 - (sum % 11);
  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return String(dv);
};

/** Quita puntos, guion y espacios, pasa la K a mayúscula y elimina ceros a la izquierda. */
export const normalizeRut = (input: string): string =>
  input.replace(/[^0-9kK]/g, '').toUpperCase().replace(/^0+/, '');

const split = (normalized: string) => ({
  body: normalized.slice(0, -1),
  dv: normalized.slice(-1),
});

/**
 * Valida formato y dígito verificador. Devuelve el RUT normalizado si es válido
 * o `null` si no lo es.
 */
export const parseRut = (input: string): string | null => {
  const trimmed = input.trim();
  if (!RUT_FORMAT.test(trimmed)) return null;

  const normalized = normalizeRut(trimmed);
  const { body, dv } = split(normalized);
  if (body.length === 0) return null;

  return computeDv(body) === dv ? normalized : null;
};

export const isValidRut = (input: string): boolean => parseRut(input) !== null;

/** Formatea un RUT como `12.345.678-5`. Acepta cualquier forma de entrada. */
export const formatRut = (input: string): string => {
  const { body, dv } = split(normalizeRut(input));
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
};

/** Compara dos RUTs ignorando formato (puntos, guion, mayúsculas). */
export const isSameRut = (a: string, b: string): boolean => normalizeRut(a) === normalizeRut(b);
