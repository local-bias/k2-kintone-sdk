import chokidar from 'chokidar';
import cssnanoPlugin from 'cssnano';
import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';
import postcss from 'postcss';
import { debounce } from 'remeda';
import tailwindcss from '@tailwindcss/postcss';
import invariant from 'tiny-invariant';

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

export const outputCss = async (params: {
  inputPath: string;
  outputPath: string;
  minify?: boolean;
}) => {
  const { inputPath, outputPath, minify = false } = params;

  const css = await fs.readFile(inputPath, 'utf8');

  const result = await postcss([
    tailwindcss({ base: path.dirname(inputPath), optimize: minify }),
    ...(minify ? [cssnanoPlugin()] : []),
  ]).process(css, {
    from: inputPath,
    to: outputPath,
  });

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
  /** content glob patterns for file watching */
  contentPatterns?: string[];
  /** callback function */
  onChanges?: (params: { input: string; output: string; type: WatchType }) => void;
}) => {
  const { input, output, contentPatterns } = params;

  const patterns = contentPatterns ?? ['./src/**/*.{ts,tsx}'];

  const files = await glob([...patterns, input], { ignore: ['**/node_modules/**'] });

  const watcher = chokidar.watch(files, {
    persistent: true,
    ignoreInitial: true,
  });

  let isInitialized = false;

  const processChanges = async (type: WatchType) => {
    try {
      await outputCss({ inputPath: input, outputPath: output });
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
