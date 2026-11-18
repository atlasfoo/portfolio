/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['infra/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    setupFiles: ['./vitest.setup.ts'],
  },
  // Astro's ViteUserConfig type omits Vitest's test field; runtime still accepts it.
} as Parameters<typeof getViteConfig>[0]);
