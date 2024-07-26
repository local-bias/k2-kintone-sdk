import path from 'path';
import chalk from 'chalk';
import { getTailwindConfigFromK2Config, watchTailwindCSS } from '../../lib/tailwind.js';
import fs from 'fs-extra';

export const watchCss = async (params: { k2Config: K2.Config; outdir: string }) => {
  const { k2Config, outdir } = params;
  if (!k2Config.tailwind?.css || !k2Config.tailwind?.config) {
    console.log('🚫 missing tailwind config. Skip watching css.');
    return;
  }

  const tailwindConfig = await getTailwindConfigFromK2Config(k2Config.tailwind);

  const input = path.resolve(k2Config.tailwind.css);
  const output = path.join(outdir, 'tailwind.css');

  if (!(await fs.pathExists(output))) {
    await fs.outputFile(output, '');
  }

  return watchTailwindCSS({
    input,
    output: path.join(outdir, 'tailwind.css'),
    config: tailwindConfig,
    onChanges: ({ output, type }) => {
      const outputFileName = path.basename(output);
      console.log(
        chalk.hex('#e5e7eb')(`${new Date().toLocaleTimeString()} `) +
          chalk.cyan(`[css] `) +
          outputFileName +
          (type === 'init' ? ' init' : ` rebuilt`)
      );
    },
  });
};
