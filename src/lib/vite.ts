import { InlineConfig } from 'vite';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export const getViteConfig = (config: Partial<InlineConfig>): InlineConfig => {
  return {
    ...config,
    configFile: false,
    build: {
      ...config.build,
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
    plugins: [...(config.plugins ?? []), tsconfigPaths()],
    resolve: {
      ...config.resolve,
      alias: { '@': path.resolve('src') },
    },
  };
};
