import { existsSync, readdirSync } from 'fs';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { cwd } from 'process';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import chalk from 'chalk';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

export const buildWithWebpack = async (props: {
  mode: 'app' | 'plugin';
  srcRoot: string;
  distRoot: string;
}) => {
  const { mode, srcRoot, distRoot } = props;

  /** @type { Record<string, string> } */
  let entry = {};
  if (mode === 'app') {
    const appsRoot = path.join(srcRoot, 'apps');
    const allProjects = readdirSync(appsRoot);

    entry = allProjects.reduce((acc, dir) => {
      for (const filename of ['index.ts', 'index.js', 'index.mjs']) {
        if (existsSync(path.join(appsRoot, dir, filename))) {
          return { ...acc, [dir]: path.join(appsRoot, dir, filename) };
        }
      }
      return acc;
    }, {});
  } else {
    entry = {
      desktop: path.join(srcRoot, 'desktop', 'index.ts'),
      config: path.join(srcRoot, 'config', 'index.ts'),
    };
  }

  const exclude = /node_modules/;
  const styleLoader = MiniCssExtractPlugin.loader;

  return new Promise<void>((resolve, reject) => {
    webpack(
      {
        mode: 'production',
        target: ['web', 'es2023'],
        entry,
        resolve: {
          extensions: ['.ts', '.tsx', '.js', '.json'],
          fallback: {
            path: false,
          },
          plugins: [new TsconfigPathsPlugin({ configFile: path.join(cwd(), 'tsconfig.json') })],
        },
        cache: { type: 'filesystem' },
        output: {
          filename: '[name].js',
          path: path.resolve(cwd(), ...distRoot.split(/[\\\/]/g)),
        },
        module: {
          rules: [
            { test: /\.tsx?$/, exclude, loader: 'ts-loader' },
            { test: /\.css$/, use: [styleLoader, 'css-loader'] },
            {
              test: /\.scss$/,
              use: [
                styleLoader,
                'css-loader',
                { loader: 'sass-loader', options: { sassOptions: { outputStyle: 'expanded' } } },
              ],
            },
          ],
        },
        plugins: [new MiniCssExtractPlugin()],
        optimization: {
          minimize: true,
          minimizer: [new TerserPlugin({ extractComments: false })],
        },
      },
      (err, stats) => {
        if (err) {
          reject(err);
        } else {
          if (stats?.compilation.errors.length) {
            reject(
              [
                chalk.red('⚠ 本番用ビルドでエラーが発生しました'),
                ...stats.compilation.errors.map((error) => error.message),
              ].join('\n')
            );
          } else {
            resolve();
          }
        }
      }
    );
  });
};
