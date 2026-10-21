import type { TokenClaims } from './auth.js';

declare global {
  namespace Express {
    interface Request {
      /** Claims del JWT verificado. Lo asigna el middleware `authenticate`. */
      auth?: TokenClaims;
    }

    interface Locals {
      /** RUT normalizado del parámetro de ruta. Lo asigna `validateRutParam`. */
      rut?: string;
    }
  }
}

export {};
