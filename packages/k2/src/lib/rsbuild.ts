import { createRsbuild, type RsbuildConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';
import fs from 'fs-extra';

function getRsbuildPlugins() {
  return [
    pluginReact({
      swcReactOptions: {
        runtime: 'automatic',
      },
    }),
  ];
}

function shouldWriteDevAssetToDisk(file: string): boolean {
  return !file.includes('.hot-update.');
}

async function removeHotUpdateFiles(outDir: string): Promise<void> {
  if (!fs.existsSync(outDir)) {
    return;
  }

  const fileNames = (await fs.readdir(outDir, { encoding: 'utf8' })).map((fileName) =>
    fileName.toString()
  );
  await Promise.all(
    fileNames
      .filter((fileName) => fileName.includes('.hot-update.'))
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

  const sourceMapConfig =
    sourcemap === 'inline' ? 'cheap-module-source-map' : sourcemap ? 'source-map' : false;

  const rsbuild = await createRsbuild({
    rsbuildConfig: {
      plugins: getRsbuildPlugins(),
      source: { entry: entries },
      output: {
        target: 'web',
        distPath: { root: outDir, js: '' },
        filename: { js: '[name].js' },
        filenameHash: false,
        cleanDistPath: true,
        injectStyles,
        sourceMap: { js: sourceMapConfig as any },
        minify,
      },
      performance: {
        chunkSplit: { strategy: 'all-in-one' },
      },
      tools: {
        htmlPlugin: false,
      },
    },
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
    plugins: getRsbuildPlugins(),
    source: { entry: entries },
    output: {
      target: 'web',
      distPath: { root: outDir, js: '' },
      filename: { js: '[name].js' },
      filenameHash: false,
      cleanDistPath: false,
      injectStyles: true,
      sourceMap: { js: 'cheap-module-source-map' as any },
      minify: false,
    },
    performance: {
      chunkSplit: { strategy: 'all-in-one' },
    },
    tools: {
      htmlPlugin: false,
    },
    server: {
      port,
      host: '0.0.0.0',
      ...(https ? { https } : {}),
      ...(publicDir && fs.existsSync(publicDir) ? { publicDir: { name: publicDir } } : {}),
    },
    dev: {
      writeToDisk: shouldWriteDevAssetToDisk,
    },
  };

  const rsbuild = await createRsbuild({ rsbuildConfig });

  if (onFirstCompile || onRecompile) {
    rsbuild.addPlugins([
      {
        name: 'k2-dev-hooks',
        setup(api) {
          api.onAfterDevCompile(async ({ isFirstCompile }) => {
            if (isFirstCompile && onFirstCompile) {
              await onFirstCompile();
            } else if (!isFirstCompile && onRecompile) {
              await onRecompile();
            }
          });
        },
      },
    ]);
  }

  const result = await rsbuild.startDevServer();

  return {
    port: result.port,
    close: result.server.close,
  };
}

/**
 * プラグインのエントリーポイントを取得します (config, desktop)
 */
export function getPluginEntryPoints(params: {
  configEntry: string;
  desktopEntry: string;
}): Record<string, string> {
  const { configEntry, desktopEntry } = params;
  const entries: Record<string, string> = {};

  for (const ext of ['index.ts', 'index.tsx', 'index.js', 'index.jsx']) {
    const configPath = path.join(configEntry, ext);
    if (fs.existsSync(configPath)) {
      entries.config = configPath;
      break;
    }
  }

  for (const ext of ['index.ts', 'index.tsx', 'index.js', 'index.jsx']) {
    const desktopPath = path.join(desktopEntry, ext);
    if (fs.existsSync(desktopPath)) {
      entries.desktop = desktopPath;
      break;
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

  const allProjects = fs.readdirSync(inputDir);
  return allProjects.reduce<Record<string, string>>((acc, dir) => {
    const dirPath = path.join(inputDir, dir);
    if (!fs.statSync(dirPath).isDirectory()) return acc;

    for (const filename of ['index.ts', 'index.tsx', 'index.js', 'index.jsx', 'index.mjs']) {
      const filePath = path.join(inputDir, dir, filename);
      if (fs.existsSync(filePath)) {
        return { ...acc, [dir]: filePath };
      }
    }
    return acc;
  }, {});
}
