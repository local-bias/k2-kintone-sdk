import path from 'path';
import { esmImport } from '../lib/import.js';
import { outputCss } from '../lib/tailwind.js';

export const buildTailwind = async (config: K2.FullConfig) => {
  if (!config.tailwind?.css || !config.tailwind?.config) {
    return;
  }
  const tailwindConfig = (await esmImport(path.resolve(config.tailwind.config))).default;

  const inputPath = path.resolve(config.tailwind.css);

  await outputCss({
    inputPath,
    outputPath: path.join(config.outDir, 'tailwind.css'),
    config: tailwindConfig,
    minify: true,
  });
  console.log('✨ Built tailwind.css');
};
