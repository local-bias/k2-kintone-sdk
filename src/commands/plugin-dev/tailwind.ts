import fs from 'fs-extra';
import path from 'path';
import { type Config as TailwindConfig } from 'tailwindcss';
import { PLUGIN_DEVELOPMENT_DIRECTORY } from '../../lib/constants.js';
import chokidar from 'chokidar';
import chalk from 'chalk';
import { getTailwindConfig, outputCss } from '../../lib/tailwind.js';

async function buildTailwindCSS(params: {
  inputFile: string;
  outputFileName: string;
  config: TailwindConfig;
}) {
  const { inputFile, outputFileName, config } = params;
  const inputPath = path.resolve(inputFile);
  const outputPath = path.join(PLUGIN_DEVELOPMENT_DIRECTORY, outputFileName);

  const css = await fs.readFile(inputPath, 'utf8');

  const watcher = chokidar.watch(
    [...((config.content as string[] | undefined) ?? ['./src/**/*.{ts,tsx}']), inputPath],
    {
      ignored: /node_modules/,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    }
  );

  let initialScanComplete = false;

  const listener = async (type: string, path?: string) => {
    try {
      if (type === 'add' && !initialScanComplete) {
        return;
      }

      await outputCss({ css, inputPath, outputPath, config });

      console.log(
        chalk.hex('#e5e7eb')(`${new Date().toLocaleTimeString()} `) +
          chalk.cyan(`[css] `) +
          outputFileName +
          (type === 'init' ? ' init' : ` rebuilt`)
      );
    } catch (error) {
      console.error('Error building Tailwind CSS:', error);
    }
  };

  watcher.on('ready', async () => {
    initialScanComplete = true;
    await listener('init');
  });

  watcher.on('change', (path) => listener('change', path));
  watcher.on('add', (path) => listener('add', path));
  watcher.on('unlink', () => listener('unlink'));
}

export const watchCss = async (pluginConfig: Plugin.Meta.Config) => {
  if (!pluginConfig.tailwind?.css || !pluginConfig.tailwind?.config) {
    return;
  }

  const tailwindConfig = await getTailwindConfig(pluginConfig.tailwind);

  const inputFile = path.resolve(pluginConfig.tailwind.css);

  return Promise.all([
    buildTailwindCSS({ inputFile, outputFileName: 'desktop.css', config: tailwindConfig.desktop }),
    buildTailwindCSS({ inputFile, outputFileName: 'config.css', config: tailwindConfig.config }),
  ]);
};
