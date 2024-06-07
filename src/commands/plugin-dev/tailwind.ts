import fs from 'fs-extra';
import path from 'path';
import postcss from 'postcss';
import tailwindcss, { type Config as TailwindConfig } from 'tailwindcss';
import { PLUGIN_DEVELOPMENT_DIRECTORY } from '../../lib/constants.js';
import { esmImport } from '../../lib/import.js';
import chokidar from 'chokidar';

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
    (config.content as string[] | undefined) ?? ['./src/**/*.{ts,tsx}'],
    { ignored: /node_modules/, persistent: true }
  );

  const listener = async () => {
    try {
      const result = await postcss([tailwindcss(config)]).process(css, {
        from: inputPath,
        to: outputPath,
      });

      await fs.writeFile(outputPath, result.css);

      if (result.map) {
        await fs.writeFile(`${outputPath}.map`, result.map.toString());
      }
      console.log(`🎨 Successfully built Tailwind CSS to ${outputPath}`);
    } catch (error) {
      console.error('Error building Tailwind CSS:', error);
    }
  };

  await listener();

  watcher.on('change', listener);
  watcher.on('add', listener);
  watcher.on('unlink', listener);
}

export const watchCss = async (pluginConfig: Plugin.Meta.Config) => {
  if (!pluginConfig.tailwind?.css || !pluginConfig.tailwind?.config) {
    return;
  }

  const { css, config: configPath } = pluginConfig.tailwind;

  const configPathForDesktop = typeof configPath === 'string' ? configPath : configPath.desktop;
  const configPathForConfig = typeof configPath === 'string' ? configPath : configPath.config;

  const desktopConfig = await esmImport(path.resolve(configPathForDesktop));
  const configConfig = await esmImport(path.resolve(configPathForConfig));

  const inputFile = path.resolve(css);

  return Promise.all([
    buildTailwindCSS({ inputFile, outputFileName: 'desktop.css', config: desktopConfig }),
    buildTailwindCSS({ inputFile, outputFileName: 'config.css', config: configConfig }),
  ]);
};
