import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { calculateScore } from '../src/services/score.service.js';

const app = createApp();
const SECRET = 'test-secret';

const sign = (payload: object, options: jwt.SignOptions = {}, secret = SECRET) =>
  jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: 60, ...options });

const adminToken = sign({ sub: 'u-001', role: 'admin' });
const userToken = sign({ sub: 'u-002', role: 'user', rut: '123456785' });

const getScore = (rut: string, token?: string) => {
  const req = request(app).get(`/score/${encodeURIComponent(rut)}`);
  return token ? req.set('Authorization', `Bearer ${token}`) : req;
};

const base64url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

describe('GET /score/:rut — respuesta', () => {
  it('devuelve rut formateado, score determinista y fecha ISO', async () => {
    const res = await getScore('12345678-5', adminToken);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      rut: '12.345.678-5',
      score: calculateScore('123456785'),
      fecha: expect.any(String),
    });
    expect(new Date(res.body.fecha).toISOString()).toBe(res.body.fecha);
  });

  it('el mismo RUT devuelve siempre el mismo score', async () => {
    const [a, b] = await Promise.all([
      getScore('12.345.678-5', adminToken),
      getScore('123456785', adminToken),
    ]);
    expect(a.body.score).toBe(b.body.score);
  });

  it('funciona con un token real emitido por POST /login', async () => {
    const login = await request(app)
      .post('/login')
      .send({ username: 'usuario', password: 'usuario123' });
    const res = await getScore('12.345.678-5', login.body.token);

    expect(res.status).toBe(200);
  });
});

describe('GET /score/:rut — autorización', () => {
  it.each(['11.111.111-1', '12.345.678-5', '10.000.013-K'])(
    'admin puede consultar cualquier RUT (%s)',
    async (rut) => {
      const res = await getScore(rut, adminToken);
      expect(res.status).toBe(200);
    },
  );

  it.each(['12.345.678-5', '12345678-5', '123456785'])(
    'user puede consultar su propio RUT en cualquier formato (%s)',
    async (rut) => {
      const res = await getScore(rut, userToken);
      expect(res.status).toBe(200);
      expect(res.body.rut).toBe('12.345.678-5');
    },
  );

  it('user no puede consultar un RUT ajeno → 403 FORBIDDEN_RUT', async () => {
    const res = await getScore('11.111.111-1', userToken);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      error: { code: 'FORBIDDEN_RUT', message: 'No tienes permiso para consultar este RUT.' },
    });
  });
});

describe('GET /score/:rut — autenticación (401)', () => {
  it('sin header Authorization → MISSING_TOKEN con WWW-Authenticate', async () => {
    const res = await getScore('12.345.678-5');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('MISSING_TOKEN');
    expect(res.headers['www-authenticate']).toBe('Bearer');
  });

  it('esquema distinto de Bearer → MISSING_TOKEN', async () => {
    const res = await request(app)
      .get('/score/12.345.678-5')
      .set('Authorization', 'Basic dXN1YXJpbzp1c3VhcmlvMTIz');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('MISSING_TOKEN');
  });

  it('token vencido → TOKEN_EXPIRED', async () => {
    const expired = jwt.sign(
      { sub: 'u-002', role: 'user', rut: '123456785', exp: Math.floor(Date.now() / 1000) - 10 },
      SECRET,
      { algorithm: 'HS256' },
    );
    const res = await getScore('12.345.678-5', expired);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it.each([
    ['token mal formado', 'esto-no-es-un-jwt'],
    ['firmado con otro secreto', sign({ sub: 'u-001', role: 'admin' }, {}, 'otro-secreto')],
    ['firmado con otro algoritmo', sign({ sub: 'u-001', role: 'admin' }, { algorithm: 'HS512' })],
    [
      'alg none',
      `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url({ sub: 'u-001', role: 'admin' })}.`,
    ],
    ['user sin rut', sign({ sub: 'u-002', role: 'user' })],
    ['user con rut inválido', sign({ sub: 'u-002', role: 'user', rut: '123456789' })],
    ['admin con rut', sign({ sub: 'u-001', role: 'admin', rut: '123456785' })],
    ['rol desconocido', sign({ sub: 'u-009', role: 'superadmin' })],
  ])('%s → INVALID_TOKEN', async (_case, token) => {
    const res = await getScore('12.345.678-5', token);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
});

describe('GET /score/:rut — validación y orden de evaluación', () => {
  it.each(['12.345.678-9', 'abc', '123'])('RUT inválido %s → 400 INVALID_RUT', async (rut) => {
    const res = await getScore(rut, adminToken);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_RUT');
  });

  it('401 antes que 400: RUT inválido sin token', async () => {
    const res = await getScore('12.345.678-9');
    expect(res.status).toBe(401);
  });

  it('400 antes que 403: user con RUT inválido', async () => {
    const res = await getScore('12.345.678-9', userToken);
    expect(res.status).toBe(400);
  });
});
