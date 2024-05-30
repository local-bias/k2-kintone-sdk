import { InlineConfig } from 'vite';
import path from 'path';
import { PLUGIN_DEVELOPMENT_DIRECTORY } from './constants.js';
import tsconfigPaths from 'vite-tsconfig-paths';

export const getViteConfig = (config: Partial<InlineConfig>): InlineConfig => {
  return {
    configFile: false,
    build: {
      outDir: PLUGIN_DEVELOPMENT_DIRECTORY,
      emptyOutDir: true,
      rollupOptions: {
        ...config.build?.rollupOptions,
        onwarn: (warning, warn) => {
          if (['MODULE_LEVEL_DIRECTIVE'].includes(warning.code ?? '')) {
            return;
          }
          warn(warning);
        },
      },
    },
    plugins: [tsconfigPaths()],
    server: config.server,
    resolve: {
      alias: { '@': path.resolve('src') },
    },
  };
};
