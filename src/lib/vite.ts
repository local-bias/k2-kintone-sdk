import { InlineConfig } from 'vite';
import path from 'path';
import fs from 'fs-extra';
import {
  DEFAULT_PORT,
  PLUGIN_DEVELOPMENT_DIRECTORY,
  PLUGIN_WORKSPACE_DIRECTORY,
} from './constants.js';
import tsconfigPaths from 'vite-tsconfig-paths';

export const getViteConfig = (config: Plugin.Meta.Config): InlineConfig => {
  return {
    configFile: false,
    build: {
      outDir: PLUGIN_DEVELOPMENT_DIRECTORY,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          config: path.join('src', 'config', 'index.ts'),
          desktop: path.join('src', 'desktop', 'index.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
        onwarn: (warning, warn) => {
          if (['MODULE_LEVEL_DIRECTIVE'].includes(warning.code ?? '')) {
            return;
          }
          warn(warning);
        },
      },
    },
    plugins: [tsconfigPaths()],
    server: {
      port: config.server?.port ?? DEFAULT_PORT,
      https: {
        key: fs.readFileSync(path.join(PLUGIN_WORKSPACE_DIRECTORY, 'localhost-key.pem')),
        cert: fs.readFileSync(path.join(PLUGIN_WORKSPACE_DIRECTORY, 'localhost-cert.pem')),
      },
    },
    resolve: {
      alias: { '@': path.resolve('src') },
    },
  };
};
