import path from 'path';
import { PLUGIN_DEVELOPMENT_DIRECTORY } from '../../lib/constants.js';
import chalk from 'chalk';
import { getTailwindInputCss, watchTailwindCSS } from '../../lib/tailwind.js';

async function buildTailwindCSS(params: { inputFile: string; outputFileName: string }) {
  const { inputFile, outputFileName } = params;
  const inputPath = path.resolve(inputFile);
  const outputPath = path.join(PLUGIN_DEVELOPMENT_DIRECTORY, outputFileName);

  return watchTailwindCSS({
    input: inputPath,
    output: outputPath,
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
}

export const watchCss = async (pluginConfig: Plugin.Meta.Config) => {
  if (!pluginConfig.tailwind?.css) {
    return;
  }

  const inputFile = getTailwindInputCss(pluginConfig.tailwind);

  return Promise.all([
    buildTailwindCSS({
      inputFile: inputFile.desktop,
      outputFileName: 'desktop.css',
    }),
    buildTailwindCSS({
      inputFile: inputFile.config,
      outputFileName: 'config.css',
    }),
  ]);
};
