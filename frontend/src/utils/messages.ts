import { ApiError } from '../api/client';
import type { ErrorCode } from '../api/types';

/**
 * Mensajes al usuario por código de error.
 *
 * Tono: directo y breve, en segunda persona, sin jerga técnica. Cada mensaje
 * dice qué pasó y qué puede hacer la persona a continuación.
 */
export interface UserMessage {
  title: string;
  description: string;
  tone: 'danger' | 'warning' | 'info';
}

const MESSAGES: Record<ErrorCode, UserMessage> = {
  VALIDATION_ERROR: {
    title: 'Revisa los datos',
    description: 'Completa usuario y contraseña para continuar.',
    tone: 'warning',
  },
  INVALID_CREDENTIALS: {
    title: 'No pudimos iniciar sesión',
    description: 'El usuario o la contraseña no son correctos. Inténtalo de nuevo.',
    tone: 'danger',
  },
  INVALID_RUT: {
    title: 'RUT no válido',
    description: 'Revisa el número y el dígito verificador. Ejemplo: 12.345.678-5.',
    tone: 'warning',
  },
  FORBIDDEN_RUT: {
    title: 'Consulta no permitida',
    description: 'Tu perfil solo puede consultar el RUT asociado a tu cuenta.',
    tone: 'danger',
  },
  MISSING_TOKEN: {
    title: 'Inicia sesión para continuar',
    description: 'Necesitas una sesión activa para consultar scores.',
    tone: 'info',
  },
  INVALID_TOKEN: {
    title: 'Tu sesión no es válida',
    description: 'Por seguridad cerramos la sesión. Vuelve a ingresar.',
    tone: 'warning',
  },
  TOKEN_EXPIRED: {
    title: 'Tu sesión expiró',
    description: 'Por seguridad las sesiones duran un tiempo limitado. Vuelve a ingresar.',
    tone: 'info',
  },
  NOT_FOUND: {
    title: 'Recurso no encontrado',
    description: 'La operación solicitada no existe.',
    tone: 'danger',
  },
  INTERNAL_ERROR: {
    title: 'Algo salió mal de nuestro lado',
    description: 'No es un problema con tus datos. Intenta nuevamente en unos minutos.',
    tone: 'danger',
  },
  NETWORK_ERROR: {
    title: 'Sin conexión con el servidor',
    description: 'Revisa tu conexión a internet o que la API esté disponible.',
    tone: 'danger',
  },
  TIMEOUT: {
    title: 'El servidor no respondió a tiempo',
    description: 'Intenta nuevamente en unos segundos.',
    tone: 'warning',
  },
  UNKNOWN_ERROR: {
    title: 'Respuesta inesperada',
    description: 'Intenta nuevamente. Si el problema continúa, contacta a soporte.',
    tone: 'danger',
  },
};

export const messageForCode = (code: ErrorCode): UserMessage => MESSAGES[code];

export const messageForError = (error: unknown): UserMessage =>
  error instanceof ApiError ? MESSAGES[error.code] : MESSAGES.UNKNOWN_ERROR;
