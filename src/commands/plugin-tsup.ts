import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import type { Options } from 'tsup';
import { PLUGIN_CONTENTS_DIRECTORY } from '../lib/constants.js';
import { importK2PluginConfig } from '../lib/import.js';
import { lint } from '../lib/lint.js';
import { getTailwindConfig, getTailwindInputCss, outputCss } from '../lib/tailwind.js';
import { buildWithTsup } from '../lib/tsup.js';

export default function command() {
  program
    .command('tsup')
    .description("Build the project for production. (It's a wrapper of webpack build command.)")
    .action(action);
}

export async function action() {
  console.group('🍳 Build the project for production');

  try {
    const config = await importK2PluginConfig();

    if (config?.lint?.build) {
      await lint();
      console.log('✨ Lint success.');
    }

    if (!fs.existsSync(PLUGIN_CONTENTS_DIRECTORY)) {
      await fs.mkdir(PLUGIN_CONTENTS_DIRECTORY, { recursive: true });
    }

    if (config.tailwind?.css && config.tailwind?.config) {
      const tailwindConfig = await getTailwindConfig(config.tailwind);

      const inputFile = getTailwindInputCss(config.tailwind);

      await outputCss({
        inputPath: inputFile.config,
        outputPath: path.join(PLUGIN_CONTENTS_DIRECTORY, 'config.css'),
        config: tailwindConfig.config,
        minify: true,
      });
      console.log('✨ Built config.css');
      await outputCss({
        inputPath: inputFile.desktop,
        outputPath: path.join(PLUGIN_CONTENTS_DIRECTORY, 'desktop.css'),
        config: tailwindConfig.desktop,
        minify: true,
      });
      console.log('✨ Built desktop.css');
    }

    const entryPoints: Options['entry'] = ['desktop', 'config'].reduce(
      (acc, dir) => ({
        ...acc,
        [dir]: path.join('src', dir, 'index.ts'),
      }),
      {}
    );

    await buildWithTsup({
      entryPoints,
      outDir: PLUGIN_CONTENTS_DIRECTORY,
      minify: true,
      treeshake: true,
      sourcemap: false,
    });
    console.log('✨ Built desktop.js and config.js');
    console.log('✨ Build success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
