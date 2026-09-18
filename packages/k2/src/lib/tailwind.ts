import chokidar from 'chokidar';
import cssnanoPlugin from 'cssnano';
import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'node:path';
import postcss from 'postcss';
import invariant from 'tiny-invariant';
import { debounce } from './debounce.js';

/** contentの変更を検知してからCSSを再生成するまでの待機時間 */
const REBUILD_DEBOUNCE_MS = 1000;

/** contentの監視対象のデフォルトglobパターン */
const DEFAULT_CONTENT_PATTERNS = ['./src/**/*.{ts,tsx}'];

/**
 * Tailwind CSS はオプショナルなpeerDependencyのため、実際に使用されるまで読み込みません
 */
const loadTailwindPostcssPlugin = async () => {
  try {
    const { default: tailwindcss } = await import('@tailwindcss/postcss');
    return tailwindcss;
  } catch {
    throw new Error(
      'Tailwind CSS を利用するには `@tailwindcss/postcss` と `tailwindcss` のインストールが必要です。'
    );
  }
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

export const outputCss = async (params: {
  inputPath: string;
  outputPath: string;
  minify?: boolean;
}) => {
  const { inputPath, outputPath, minify = false } = params;

  const tailwindcss = await loadTailwindPostcssPlugin();
  const css = await fs.readFile(inputPath, 'utf8');

  const result = await postcss([
    // `base` を省略し、Tailwind CSS 標準どおりカレントディレクトリ (プロジェクトルート) からクラスを検出します
    tailwindcss({ optimize: minify }),
    ...(minify ? [cssnanoPlugin()] : []),
  ]).process(css, {
    from: inputPath,
    to: outputPath,
  });

  await fs.outputFile(outputPath, result.css);

  if (result.map) {
    await fs.outputFile(`${outputPath}.map`, result.map.toString());
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
  const { input, output, contentPatterns = DEFAULT_CONTENT_PATTERNS, onChanges } = params;

  // chokidar v4 は glob パターンを解釈しないため、事前にファイル一覧へ展開します
  const files = await glob([...contentPatterns, input], { ignore: ['**/node_modules/**'] });

  const watcher = chokidar.watch(files, { persistent: true, ignoreInitial: true });

  const processChanges = async (type: WatchType) => {
    try {
      await outputCss({ inputPath: input, outputPath: output });
      onChanges?.({ input, output, type });
    } catch (error) {
      console.error('Error building Tailwind CSS:', error);
    }
  };

  const debouncedProcessChanges = debounce(processChanges, REBUILD_DEBOUNCE_MS);

  watcher.once('ready', () => {
    void processChanges('init');
  });
  watcher.on('error', (error) => {
    console.error('Error watching Tailwind CSS:', error);
  });
  watcher.on('add', () => debouncedProcessChanges('add'));
  watcher.on('change', () => debouncedProcessChanges('change'));
  watcher.on('unlink', () => debouncedProcessChanges('unlink'));
  watcher.on('unlinkDir', () => debouncedProcessChanges('unlink'));

  return watcher;
};
