import path from 'path';
import { type Config as TailwindConfig } from 'tailwindcss';
import { PLUGIN_DEVELOPMENT_DIRECTORY } from '../../lib/constants.js';
import chalk from 'chalk';
import { getTailwindConfigFromK2Config, watchTailwindCSS } from '../../lib/tailwind.js';

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
    onChanges: ({ input, output, type }) => {
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

export const watchCss = async (k2Config: K2.Config) => {
  if (!k2Config.tailwind?.css || !k2Config.tailwind?.config) {
    return;
  }

  const tailwindConfig = await getTailwindConfigFromK2Config(k2Config.tailwind);

  const inputFile = path.resolve(k2Config.tailwind.css);

  return buildTailwindCSS({ inputFile, outputFileName: 'styles.css', config: tailwindConfig });
};
