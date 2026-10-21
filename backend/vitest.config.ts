import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: { JWT_SECRET: 'test-secret', JWT_EXPIRES_IN: '3600' },
  },
});
