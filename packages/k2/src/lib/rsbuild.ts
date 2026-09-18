import { createRsbuild, type RsbuildConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import fs from 'fs-extra';
import path from 'node:path';
import { ENTRY_POINT_FILE_NAMES } from './constants.js';

type SourceMapConfig = NonNullable<NonNullable<RsbuildConfig['output']>['sourceMap']>;
type JsSourceMap = NonNullable<SourceMapConfig>['js'];

/** HMR用の中間ファイルの識別子 */
const HOT_UPDATE_MARKER = '.hot-update.';

function getRsbuildPlugins() {
  return [pluginReact({ swcReactOptions: { runtime: 'automatic' } })];
}

/** rsbuild の共通設定 (本番ビルド / 開発サーバーで共有) */
function getBaseRsbuildConfig(params: {
  entries: Record<string, string>;
  outDir: string;
  minify: boolean;
  sourceMap: JsSourceMap;
  injectStyles: boolean;
  cleanDistPath: boolean;
}): RsbuildConfig {
  const { entries, outDir, minify, sourceMap, injectStyles, cleanDistPath } = params;
  return {
    plugins: getRsbuildPlugins(),
    source: { entry: entries },
    output: {
      target: 'web',
      distPath: { root: outDir, js: '' },
      filename: { js: '[name].js' },
      filenameHash: false,
      cleanDistPath,
      injectStyles,
      sourceMap: { js: sourceMap },
      minify,
    },
    performance: {
      chunkSplit: { strategy: 'all-in-one' },
    },
    tools: {
      htmlPlugin: false,
    },
  };
}

async function removeHotUpdateFiles(outDir: string): Promise<void> {
  if (!fs.existsSync(outDir)) {
    return;
  }

  const fileNames = await fs.readdir(outDir, { encoding: 'utf8' });
  await Promise.all(
    fileNames
      .filter((fileName) => fileName.includes(HOT_UPDATE_MARKER))
      .map((fileName) => fs.remove(path.join(outDir, fileName)))
  );
}

/**
 * rsbuild で本番ビルドを実行します
 */
export async function buildWithRsbuild(params: {
  entries: Record<string, string>;
  outDir: string;
  minify?: boolean;
  sourcemap?: boolean | 'inline';
  injectStyles?: boolean;
}): Promise<void> {
  const { entries, outDir, minify = true, sourcemap = false, injectStyles = true } = params;

  const sourceMap: JsSourceMap =
    sourcemap === 'inline' ? 'cheap-module-source-map' : sourcemap ? 'source-map' : false;

  const rsbuild = await createRsbuild({
    rsbuildConfig: getBaseRsbuildConfig({
      entries,
      outDir,
      minify,
      sourceMap,
      injectStyles,
      cleanDistPath: true,
    }),
  });

  await rsbuild.build();
}

/**
 * rsbuild 開発サーバーを起動します
 */
export async function startRsbuildDevServer(params: {
  entries: Record<string, string>;
  outDir: string;
  port: number;
  https?: { key: Buffer; cert: Buffer };
  publicDir?: string;
  onFirstCompile?: () => void | Promise<void>;
  onRecompile?: () => void | Promise<void>;
}): Promise<{ port: number; close: () => Promise<void> }> {
  const { entries, outDir, port, https, publicDir, onFirstCompile, onRecompile } = params;

  await removeHotUpdateFiles(outDir);

  const rsbuildConfig: RsbuildConfig = {
    ...getBaseRsbuildConfig({
      entries,
      outDir,
      minify: false,
      sourceMap: 'cheap-module-source-map',
      injectStyles: true,
      cleanDistPath: false,
    }),
    server: {
      port,
      host: '0.0.0.0',
      ...(https ? { https } : {}),
      ...(publicDir && fs.existsSync(publicDir) ? { publicDir: { name: publicDir } } : {}),
    },
    dev: {
      // HMR用の中間ファイルはディスクに書き出さない
      writeToDisk: (file) => !file.includes(HOT_UPDATE_MARKER),
    },
  };

  const rsbuild = await createRsbuild({ rsbuildConfig });

  if (onFirstCompile || onRecompile) {
    rsbuild.addPlugins([
      {
        name: 'k2-dev-hooks',
        setup(api) {
          api.onAfterDevCompile(async ({ isFirstCompile }) => {
            await (isFirstCompile ? onFirstCompile?.() : onRecompile?.());
          });
        },
      },
    ]);
  }

  const { port: actualPort, server } = await rsbuild.startDevServer();

  return { port: actualPort, close: () => server.close() };
}

/**
 * ディレクトリ内の `index.{ts,tsx,js,jsx,mjs}` を解決します
 */
function resolveEntryPoint(dir: string): string | undefined {
  return ENTRY_POINT_FILE_NAMES.map((fileName) => path.join(dir, fileName)).find((filePath) =>
    fs.existsSync(filePath)
  );
}

/**
 * プラグインのエントリーポイントを取得します (config, desktop)
 */
export function getPluginEntryPoints(params: {
  configEntry: string;
  desktopEntry: string;
}): Record<string, string> {
  const entries: Record<string, string> = {};

  for (const [name, dir] of Object.entries({
    config: params.configEntry,
    desktop: params.desktopEntry,
  })) {
    const filePath = resolveEntryPoint(dir);
    if (filePath) {
      entries[name] = filePath;
    }
  }

  return entries;
}

/**
 * アプリのエントリーポイントをディレクトリから取得します
 */
export function getAppEntryPoints(inputDir: string): Record<string, string> {
  if (!fs.existsSync(inputDir)) {
    return {};
  }

  const entries: Record<string, string> = {};

  for (const dirName of fs.readdirSync(inputDir)) {
    const dirPath = path.join(inputDir, dirName);
    if (!fs.statSync(dirPath).isDirectory()) {
      continue;
    }
    const filePath = resolveEntryPoint(dirPath);
    if (filePath) {
      entries[dirName] = filePath;
    }
  }

  return entries;
}
