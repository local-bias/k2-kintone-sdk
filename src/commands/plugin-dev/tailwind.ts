import path from 'path';
import { type Config as TailwindConfig } from 'tailwindcss';
import { PLUGIN_DEVELOPMENT_DIRECTORY } from '../../lib/constants.js';
import chalk from 'chalk';
import { getTailwindConfig, getTailwindInputCss, watchTailwindCSS } from '../../lib/tailwind.js';

async function buildTailwindCSS(params: {
  inputFile: string;
  outputFileName: string;
  config: TailwindConfig;
}) {
  const { inputFile, outputFileName, config } = params;
  const inputPath = path.resolve(inputFile);
  const outputPath = path.join(PLUGIN_DEVELOPMENT_DIRECTORY, outputFileName);

  return watchTailwindCSS({
    input: inputPath,
    output: outputPath,
    config,
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
  if (!pluginConfig.tailwind?.css || !pluginConfig.tailwind?.config) {
    return;
  }

  const tailwindConfig = await getTailwindConfig(pluginConfig.tailwind);

  const inputFile = getTailwindInputCss(pluginConfig.tailwind);

  return Promise.all([
    buildTailwindCSS({
      inputFile: inputFile.desktop,
      outputFileName: 'desktop.css',
      config: tailwindConfig.desktop,
    }),
    buildTailwindCSS({
      inputFile: inputFile.config,
      outputFileName: 'config.css',
      config: tailwindConfig.config,
    }),
  ]);
};
