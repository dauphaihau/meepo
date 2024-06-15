import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';
import { fileURLToPath, URL } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig(configEnv => mergeConfig(
  viteConfig(configEnv),
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      exclude: [...configDefaults.exclude],
      root: fileURLToPath(new URL('./src', import.meta.url)),
      setupFiles: [
        './test/setup.ts',
      ],
      clearMocks: true,
      restoreMocks: true,
      testTimeout: 30_000,
    },
    plugins: [
      AutoImport({
        imports: [
          'vitest',
        ],
        dts: true,
      }),
    ],
  })
));
