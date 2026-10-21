import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { verifyPassword } from '../src/utils/password.js';
import { users } from '../src/data/users.mock.js';

const app = createApp();
const SECRET = 'test-secret';

const postLogin = (body: unknown) => request(app).post('/login').send(body as object);

describe('POST /login', () => {
  it('rol user: devuelve token con sub, role y rut normalizado', async () => {
    const res = await postLogin({ username: 'usuario', password: 'usuario123' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: { id: 'u-002', role: 'user', rut: '12.345.678-5' },
    });

    const payload = jwt.verify(res.body.token, SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    expect(payload).toMatchObject({ sub: 'u-002', role: 'user', rut: '123456785' });
    expect(payload.exp! - payload.iat!).toBe(3600);
  });

  it('rol admin: el token y la respuesta no incluyen rut', async () => {
    const res = await postLogin({ username: 'admin', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 'u-001', role: 'admin' });

    const payload = jwt.verify(res.body.token, SECRET) as jwt.JwtPayload;
    expect(payload).toMatchObject({ sub: 'u-001', role: 'admin' });
    expect(payload).not.toHaveProperty('rut');
  });

  it('firma con HS256', async () => {
    const res = await postLogin({ username: 'admin', password: 'admin123' });
    const { header } = jwt.decode(res.body.token, { complete: true })!;
    expect(header.alg).toBe('HS256');
  });

  it.each([
    ['contraseña incorrecta', { username: 'usuario', password: 'mala' }],
    ['usuario inexistente', { username: 'nadie', password: 'usuario123' }],
  ])('401 INVALID_CREDENTIALS con mensaje genérico (%s)', async (_case, body) => {
    const res = await postLogin(body);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: { code: 'INVALID_CREDENTIALS', message: 'Usuario o contraseña incorrectos.' },
    });
  });

  it('400 VALIDATION_ERROR con detalle cuando faltan campos', async () => {
    const res = await postLogin({ username: 'usuario' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual([{ field: 'password', message: 'Requerido' }]);
  });

  it.each([
    ['tipos inválidos', { username: 123, password: true }],
    ['campos no permitidos', { username: 'usuario', password: 'usuario123', role: 'admin' }],
    ['username demasiado largo', { username: 'a'.repeat(101), password: 'x' }],
    ['body que no es objeto', ['usuario', 'usuario123']],
  ])('400 VALIDATION_ERROR por %s', async (_case, body) => {
    const res = await postLogin(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('400 VALIDATION_ERROR sin body', async () => {
    const res = await request(app).post('/login');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('usuarios mock', () => {
  it('las contraseñas documentadas coinciden con los hashes', () => {
    const expected: Record<string, string> = {
      admin: 'admin123',
      usuario: 'usuario123',
      usuario2: 'usuario123',
    };
    for (const user of users) {
      expect(verifyPassword(expected[user.username]!, user.passwordHash)).toBe(true);
    }
  });

  it('todo user tiene rut y ningún admin lo tiene', () => {
    for (const user of users) {
      expect(Boolean(user.rut)).toBe(user.role === 'user');
    }
  });
});
