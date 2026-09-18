import path from 'node:path';
import { outputCss } from '../lib/tailwind.js';

const DEFAULT_OUTPUT_FILE_NAME = 'tailwind.css';

export const buildTailwind = async (config: K2.FullConfig) => {
  if (!config.tailwind?.css) {
    return;
  }

  const fileName = config.tailwind.fileName ?? DEFAULT_OUTPUT_FILE_NAME;

  await outputCss({
    inputPath: path.resolve(config.tailwind.css),
    outputPath: path.join(config.outDir, fileName),
    minify: true,
  });
  console.log(`✨ Built ${fileName}`);
};
