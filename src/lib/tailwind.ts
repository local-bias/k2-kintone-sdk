import cssnanoPlugin from 'cssnano';
import fs from 'fs-extra';
import path from 'path';
import postcss from 'postcss';
import tailwindcss, { type Config as TailwindConfig } from 'tailwindcss';
import invariant from 'tiny-invariant';
import { esmImport } from './import.js';
import chokidar from 'chokidar';

export const getTailwindConfigFromK2Config = async (
  k2Config: K2.Config['tailwind']
): Promise<TailwindConfig> => {
  invariant(k2Config?.config, 'tailwind.config is required');
  const config = (await esmImport(path.resolve(k2Config?.config))).default;
  return config;
};

export const getTailwindConfig = async (
  config: Plugin.Meta.Config['tailwind']
): Promise<{
  desktop: TailwindConfig;
  config: TailwindConfig;
}> => {
  invariant(config?.config, 'tailwind.config is required');

  const { config: configPath } = config;

  const configPathForDesktop = typeof configPath === 'string' ? configPath : configPath.desktop;
  const configPathForConfig = typeof configPath === 'string' ? configPath : configPath.config;

  const desktopConfig = (await esmImport(path.resolve(configPathForDesktop))).default;
  const configConfig = (await esmImport(path.resolve(configPathForConfig))).default;

  return { desktop: desktopConfig, config: configConfig };
};

export const outputCss = async (params: {
  inputPath: string;
  outputPath: string;
  config: TailwindConfig;
  minify?: boolean;
}) => {
  const { inputPath, outputPath, config, minify = false } = params;

  const css = await fs.readFile(inputPath, 'utf8');

  const result = await postcss([tailwindcss(config), ...(minify ? [cssnanoPlugin()] : [])]).process(
    css,
    {
      from: inputPath,
      to: outputPath,
    }
  );

  await fs.writeFile(outputPath, result.css);

  if (result.map) {
    await fs.writeFile(`${outputPath}.map`, result.map.toString());
  }
};

type WatchType = 'init' | 'add' | 'change' | 'unlink';

export const watchTailwindCSS = async (params: {
  /** input path */
  input: string;
  /** output path */
  output: string;
  /** tailwindcss config file */
  config: TailwindConfig;
  /** callback function */
  onChanges?: (params: { input: string; output: string; type: WatchType }) => void;
}) => {
  const { input, output, config } = params;

  const watcher = chokidar.watch(
    [...((config.content as string[] | undefined) ?? ['./src/**/*.{ts,tsx}']), input],
    {
      ignored: /node_modules/,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    }
  );

  let initialScanComplete = false;

  const listener = async (type: WatchType, path?: string) => {
    try {
      if (type === 'add' && !initialScanComplete) {
        return;
      }

      await outputCss({ inputPath: input, outputPath: output, config });

      if (params.onChanges) {
        params.onChanges({ input, output, type });
      }
    } catch (error) {
      console.error('Error building Tailwind CSS:', error);
    }
  };

  watcher.on('ready', async () => {
    initialScanComplete = true;
    await listener('init');
  });

  watcher.on('change', (path) => listener('change', path));
  watcher.on('add', (path) => listener('add', path));
  watcher.on('unlink', () => listener('unlink'));
};
