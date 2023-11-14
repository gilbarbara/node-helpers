import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      all: true,
      include: ['src/**/*.ts?(x)'],
      exclude: ['src/index.ts'],
      reporter: ['text', 'html', 'lcov'],
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
    globals: true,
    setupFiles: ['./tests/vitest.setup.ts'],
  },
});
