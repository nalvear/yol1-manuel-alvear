import 'dotenv/config';

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return value;
};

const positiveInt = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`La variable de entorno ${name} debe ser un entero positivo (recibido: "${raw}")`);
  }
  return value;
};

export const env = {
  port: positiveInt('PORT', 3000),
  jwtSecret: required('JWT_SECRET'),
  /** Segundos de validez del JWT (el contrato expone `expiresIn` en segundos). */
  jwtExpiresIn: positiveInt('JWT_EXPIRES_IN', 3600),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
} as const;
