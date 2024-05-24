import chalk from 'chalk';
import esbuild, { Plugin, type BuildOptions } from 'esbuild';
import path from 'path';
import { compile } from 'sass';
import { resolve } from 'path';
import { DEVELOPMENT_DIRECTORY } from './constants.js';

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
                text:
                  error instanceof Error
                    ? error.message
                    : JSON.stringify(error),
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

export const buildWithEsbuild = async (params: {
  entryPoints: BuildOptions['entryPoints'];
  outdir: string;
}) => {
  const { entryPoints, outdir } = params;
  const context = await esbuild.context({
    entryPoints,
    bundle: true,
    sourcemap: 'inline',
    platform: 'browser',
    outdir,
    plugins: [
      {
        name: 'on-end',
        setup: ({ onEnd }) =>
          onEnd(() =>
            console.log(
              chalk.hex('#d1d5db')(`${new Date().toLocaleTimeString()} `) +
                chalk.cyan(`[content] `) +
                `Compiled successfully.`
            )
          ),
      },
      getSassPlugin(),
    ],
  });

  context.watch();
};
