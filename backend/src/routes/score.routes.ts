import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizeRut } from '../middlewares/authorize-rut.js';
import { validateRutParam } from '../middlewares/validate-rut.js';
import { getScore } from '../services/score.service.js';

export const scoreRouter = Router();

// Orden del contrato: 401 (token) → 400 (RUT inválido) → 403 (sin permiso).
scoreRouter.get('/score/:rut', authenticate, validateRutParam, authorizeRut, (_req, res) => {
  res.json(getScore(res.locals.rut!));
});
