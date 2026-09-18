import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/plugin.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  // 型定義は手書きの `types/**/*.d.ts` を公開しているため、CLI エントリーからの
  // .d.ts 生成は不要（生成物はどこからも参照されない）
  dts: false,
  clean: true,
  splitting: false,
  skipNodeModulesBundle: true,
  outDir: 'dist',
});
