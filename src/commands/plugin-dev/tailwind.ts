import fs from 'fs-extra';
import path from 'path';
import postcss from 'postcss';
import tailwindcss, { type Config as TailwindConfig } from 'tailwindcss';
import { PLUGIN_DEVELOPMENT_DIRECTORY } from '../../lib/constants.js';
import { esmImport } from '../../lib/import.js';
import chokidar from 'chokidar';
import chalk from 'chalk';

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

      const result = await postcss([tailwindcss(config)]).process(css, {
        from: inputPath,
        to: outputPath,
      });

      await fs.writeFile(outputPath, result.css);

      if (result.map) {
        await fs.writeFile(`${outputPath}.map`, result.map.toString());
      }

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

  await listener('init');

  watcher.on('ready', () => {
    initialScanComplete = true;
  });

  watcher.on('change', (path) => listener('change', path));
  watcher.on('add', (path) => listener('add', path));
  watcher.on('unlink', () => listener('unlink'));
}

export const watchCss = async (pluginConfig: Plugin.Meta.Config) => {
  if (!pluginConfig.tailwind?.css || !pluginConfig.tailwind?.config) {
    return;
  }

  const { css, config: configPath } = pluginConfig.tailwind;

  const configPathForDesktop = typeof configPath === 'string' ? configPath : configPath.desktop;
  const configPathForConfig = typeof configPath === 'string' ? configPath : configPath.config;

  const desktopConfig = (await esmImport(path.resolve(configPathForDesktop))).default;
  const configConfig = (await esmImport(path.resolve(configPathForConfig))).default;

  const inputFile = path.resolve(css);

  return Promise.all([
    buildTailwindCSS({ inputFile, outputFileName: 'desktop.css', config: desktopConfig }),
    buildTailwindCSS({ inputFile, outputFileName: 'config.css', config: configConfig }),
  ]);
};
