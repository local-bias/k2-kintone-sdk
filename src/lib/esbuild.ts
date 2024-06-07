import chalk from 'chalk';
import esbuild, { Plugin, type BuildOptions } from 'esbuild';
import { compile } from 'sass';
import { resolve } from 'path';

export const getSassPlugin = (): Plugin => {
  const pluginName = 'esbuild-plugin-sass';

  return {
    name: pluginName,
    setup(build) {
      build.onResolve({ filter: /\.s[ac]ss$/ }, (args) => ({
        path: resolve(args.resolveDir, args.path),
        namespace: pluginName,
      }));

      build.onLoad({ filter: /.*/, namespace: pluginName }, async (args) => {
        try {
          const result = compile(args.path);
          return {
            contents: result.css,
            loader: 'css',
            watchFiles: [args.path],
          };
        } catch (error) {
          return {
            pluginName,
            errors: [
              {
                text: error instanceof Error ? error.message : JSON.stringify(error),
                pluginName,
                location: { file: args.path, namespace: pluginName },
              },
            ],
          };
        }
      });
    },
  };
};

export const getEsbuildContext = async (params: BuildOptions) => {
  return esbuild.context({
    bundle: true,
    platform: 'browser',
    plugins: [
      {
        name: 'on-end',
        setup: ({ onEnd }) =>
          onEnd(() =>
            console.log(
              chalk.hex('#e5e7eb')(`${new Date().toLocaleTimeString()} `) +
                chalk.cyan(`[js] `) +
                `rebuilt`
            )
          ),
      },
      getSassPlugin(),
    ],
    ...params,
  });
};

export const buildWithEsbuild = async (params: BuildOptions) => {
  const context = await getEsbuildContext(params);
  context.watch();
};
