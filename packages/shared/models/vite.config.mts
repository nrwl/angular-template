import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/packages/shared/models',
  resolve: { tsconfigPaths: true },
  test: {
    name: 'models',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    passWithNoTests: true,
    coverage: {
      reportsDirectory: '../../../coverage/packages/shared/models',
      provider: 'v8' as const,
    },
  },
}));
