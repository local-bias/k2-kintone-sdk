import { existsSync, readdirSync } from 'fs';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { join, resolve } from 'path';
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

  const root = join(cwd(), srcRoot);
  /** @type { Record<string, string> } */
  let entry = {};
  if (mode === 'app') {
    const appsRoot = join(root, 'apps');
    const allProjects = readdirSync(appsRoot);

    entry = allProjects.reduce((acc, dir) => {
      for (const filename of ['index.ts', 'index.js', 'index.mjs']) {
        if (existsSync(join(appsRoot, dir, filename))) {
          return { ...acc, [dir]: join(appsRoot, dir, filename) };
        }
      }
      return acc;
    }, {});
  } else {
    entry = {
      desktop: join(root, 'desktop', 'index.ts'),
      config: join(root, 'config', 'index.ts'),
    };
  }

  const exclude = /node_modules/;
  const styleLoader = MiniCssExtractPlugin.loader;

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
        plugins: [new TsconfigPathsPlugin({ configFile: join(cwd(), 'tsconfig.json') })],
      },
      cache: { type: 'filesystem' },
      output: {
        filename: '[name].js',
        path: resolve(cwd(), ...distRoot.split(/[\\\/]/g)),
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
        console.error(err);
      } else {
        if (stats?.compilation.errors.length) {
          console.error(
            `⚠ 本番用ビルドでエラーが発生しました(${stats.compilation.errors.length}件)`
          );
          stats.compilation.errors.forEach((error) => {
            console.error(error.message);
          });
        } else {
          console.log(
            chalk.hex('#d1d5db')(`${new Date().toLocaleTimeString()} `) +
              chalk.cyan(`[content] `) +
              `本番用ビルドが完了しました`
          );
        }
      }
    }
  );
};
