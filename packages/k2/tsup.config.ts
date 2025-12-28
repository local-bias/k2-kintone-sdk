import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/plugin.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  dts: true,
  clean: true,
  splitting: false,
  skipNodeModulesBundle: true,
  outDir: 'dist',
});
