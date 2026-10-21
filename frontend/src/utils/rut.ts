/**
 * Utilidades de RUT para el cliente. Replican las reglas de backend/src/utils/rut.ts
 * para validar antes de enviar y evitar errores 400 evitables. El backend sigue
 * siendo la fuente de verdad.
 */

/** Mismo patrón que `components.parameters.Rut` en openapi.yaml. */
const RUT_FORMAT = /^\d{1,2}(\.?\d{3}){2}-?[\dkK]$/;
/** Cuerpo de 7 u 8 dígitos + dígito verificador. */
const MAX_CHARS = 9;

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

export const normalizeRut = (input: string): string =>
  input.replace(/[^0-9kK]/g, '').toUpperCase().replace(/^0+/, '');

export const formatRut = (input: string): string => {
  const normalized = normalizeRut(input);
  if (normalized.length < 2) return normalized;
  const body = normalized.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${body}-${normalized.slice(-1)}`;
};

export const isSameRut = (a: string, b: string): boolean => normalizeRut(a) === normalizeRut(b);

/**
 * Formatea mientras se escribe: solo acepta dígitos y una K final, limita el
 * largo y agrega puntos y guion. Ej: "123456785" → "12.345.678-5".
 */
export const formatRutInput = (raw: string): string => {
  const cleaned = raw.replace(/[^0-9kK]/g, '').toUpperCase();
  // La K solo puede ser el último carácter (dígito verificador).
  const withoutInnerK = cleaned.slice(0, -1).replace(/K/g, '') + cleaned.slice(-1);
  return formatRut(withoutInnerK.slice(0, MAX_CHARS));
};

export type RutValidation =
  | { valid: true; normalized: string }
  | { valid: false; reason: 'empty' | 'incomplete' | 'format' | 'dv' };

export const validateRut = (input: string): RutValidation => {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, reason: 'empty' };

  const normalized = normalizeRut(trimmed);
  if (normalized.length < 8) return { valid: false, reason: 'incomplete' };
  if (!RUT_FORMAT.test(trimmed)) return { valid: false, reason: 'format' };

  const body = normalized.slice(0, -1);
  return computeDv(body) === normalized.slice(-1)
    ? { valid: true, normalized }
    : { valid: false, reason: 'dv' };
};

export const RUT_ERROR_MESSAGES: Record<Exclude<RutValidation, { valid: true }>['reason'], string> = {
  empty: 'Ingresa un RUT.',
  incomplete: 'El RUT está incompleto. Incluye el dígito verificador.',
  format: 'El formato no es válido. Ejemplo: 12.345.678-5.',
  dv: 'El dígito verificador no corresponde a este RUT.',
};
