import chokidar from 'chokidar';
import cssnanoPlugin from 'cssnano';
import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';
import postcss from 'postcss';
import { debounce } from 'remeda';
import tailwindcss, { type Config as TailwindConfig } from 'tailwindcss';
import invariant from 'tiny-invariant';
import { esmImport } from './import.js';

export const getTailwindConfigFromK2Config = async (
  k2Config: K2.Config['tailwind']
): Promise<TailwindConfig> => {
  invariant(k2Config?.config, 'tailwind.config is required');
  const config = (await esmImport(path.resolve(k2Config?.config))).default;
  return config;
};

export const getTailwindInputCss = (
  config: Plugin.Meta.Config['tailwind']
): { desktop: string; config: string } => {
  invariant(config?.css, 'tailwind.css is required');
  const { css } = config;
  if (typeof css === 'string') {
    const resolved = path.resolve(css);
    return { desktop: resolved, config: resolved };
  }
  return {
    desktop: path.resolve(css.desktop),
    config: path.resolve(css.config),
  };
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

  const content = (config.content as string[] | undefined) ?? ['./src/**/*.{ts,tsx}'];

  const files = await glob([...content, input], { ignore: ['**/node_modules/**'] });

  const watcher = chokidar.watch(files, {
    persistent: true,
    ignoreInitial: true,
  });

  let isInitialized = false;

  const processChanges = async (type: WatchType) => {
    try {
      await outputCss({ inputPath: input, outputPath: output, config });
      params.onChanges?.({ input, output, type });
    } catch (error) {
      console.error('Error building Tailwind CSS:', error);
    }
  };

  const debouncedProcessChanges = debounce(processChanges, { waitMs: 1000 });

  watcher.on('ready', async () => {
    if (!isInitialized) {
      isInitialized = true;
      await processChanges('init');
    }
  });

  watcher.on('error', (error) => {
    console.error('Error watching Tailwind CSS:', error);
  });

  watcher.on('add', (path) => {
    debouncedProcessChanges.call('add');
  });
  watcher.on('change', (path) => {
    debouncedProcessChanges.call('change');
  });
  watcher.on('unlink', (path) => {
    debouncedProcessChanges.call('unlink');
  });
  watcher.on('unlinkDir', (path) => {
    debouncedProcessChanges.call('unlink');
  });

  return watcher;
};
