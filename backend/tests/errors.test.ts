import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { AppError } from '../src/errors/app-error.js';
import { errorHandler } from '../src/middlewares/error-handler.js';

const appThrowing = (error: unknown) => {
  const app = express();
  app.get('/boom', async () => {
    throw error;
  });
  app.use(errorHandler);
  return app;
};

describe('manejo de errores', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('responde 404 NOT_FOUND para rutas inexistentes', async () => {
    const res = await request(createApp()).get('/no-existe');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'No existe la ruta GET /no-existe.' },
    });
  });

  it('responde 400 VALIDATION_ERROR ante JSON mal formado', async () => {
    const res = await request(createApp())
      .post('/login')
      .set('Content-Type', 'application/json')
      .send('{"username":');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('serializa un AppError con su status, código y detalles', async () => {
    const details = [{ field: 'password', message: 'Requerido' }];
    const res = await request(appThrowing(AppError.validation('Datos inválidos.', details))).get(
      '/boom',
    );

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos.', details },
    });
  });

  it('agrega WWW-Authenticate en los 401 de token', async () => {
    const res = await request(appThrowing(AppError.tokenExpired())).get('/boom');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
    expect(res.headers['www-authenticate']).toContain('error="invalid_token"');
  });

  it('responde 500 INTERNAL_ERROR sin filtrar el error original', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(appThrowing(new Error('detalle interno secreto'))).get('/boom');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado.' },
    });
    expect(JSON.stringify(res.body)).not.toContain('secreto');
    expect(consoleError).toHaveBeenCalled();
  });
});
