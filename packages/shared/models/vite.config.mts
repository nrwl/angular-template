import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/packages/shared/models',
  plugins: [tsconfigPaths()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ tsconfigPaths() ],
  // },
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
