import type { Role } from '../types/auth.js';

export interface MockUser {
  id: string;
  username: string;
  /** Hash scrypt (ver utils/password.ts). Las contraseñas en claro están en el README. */
  passwordHash: string;
  role: Role;
  /** RUT normalizado. Obligatorio para `user`, ausente para `admin`. */
  rut?: string;
}

/** Usuarios mock en memoria: el desafío no requiere persistencia. */
export const users: readonly MockUser[] = [
  {
    id: 'u-001',
    username: 'admin',
    // admin123
    passwordHash:
      'scrypt$4d53dbc8adf000d15f641438f8a468bd$64abb5046adea5d1cd1dee5d8b8721721075a61d4679e1a3cca82427fcb07e50a53c52803bc57fb7469b546f8e5c56fb042eef025582266d57f88381e2506454',
    role: 'admin',
  },
  {
    id: 'u-002',
    username: 'usuario',
    // usuario123
    passwordHash:
      'scrypt$2ac29ebc0b228a10ee6fc7fc0cc98949$b1def1c6e2285120aa9c9531cb7cce832f3c5d55a4079886684c5cdcaa33002eb1bab43901a79bfb9682ad77a69c6182721ecebf5f05a4aebee73255ac145198',
    role: 'user',
    rut: '123456785',
  },
  {
    id: 'u-003',
    username: 'usuario2',
    // usuario123
    passwordHash:
      'scrypt$07feaee3fb6342438bb999bc78a2adb9$664e1f800e26f6f8ecd1683244e38547051816073a6a826f595fe5b25d42897b6076a4e8873a8325315fc9dda62d65460fdeb1793facc86d2bfa5da98c228ec8',
    role: 'user',
    rut: '111111111',
  },
];

export const findUserByUsername = (username: string): MockUser | undefined =>
  users.find((user) => user.username === username);
