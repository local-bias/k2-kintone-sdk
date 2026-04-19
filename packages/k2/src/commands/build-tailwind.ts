import path from 'path';
import { outputCss } from '../lib/tailwind.js';

export const buildTailwind = async (config: K2.FullConfig) => {
  if (!config.tailwind?.css) {
    return;
  }

  const inputPath = path.resolve(config.tailwind.css);
  const fileName = config.tailwind.fileName ?? 'tailwind.css';

  await outputCss({
    inputPath,
    outputPath: path.join(config.outDir, fileName),
    minify: true,
  });
  console.log(`✨ Built ${fileName}`);
};
