import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/packages/api/products',
  resolve: { tsconfigPaths: true },
  test: {
    name: 'products',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    passWithNoTests: true,
    coverage: {
      reportsDirectory: '../../../coverage/packages/api/products',
      provider: 'v8' as const,
    },
  },
}));
