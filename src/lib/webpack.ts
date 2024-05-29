import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { cwd } from 'process';
import TerserPlugin from 'terser-webpack-plugin';
import webpack, { Configuration } from 'webpack';
import chalk from 'chalk';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

export const buildWithWebpack = async (props: {
  entries: Configuration['entry'];
  outDir: string;
}) => {
  const { entries, outDir } = props;

  const exclude = /node_modules/;
  const styleLoader = MiniCssExtractPlugin.loader;

  return new Promise<void>((resolve, reject) => {
    webpack(
      {
        mode: 'production',
        target: ['web', 'es2023'],
        entry: entries,
        resolve: {
          extensions: ['.ts', '.tsx', '.js', '.json'],
          fallback: {
            path: false,
          },
          plugins: [new TsconfigPathsPlugin({ configFile: path.join(cwd(), 'tsconfig.json') })],
        },
        cache: { type: 'filesystem' },
        output: { filename: '[name].js', path: outDir },
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
                chalk.red('⚠ Build failed.'),
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
