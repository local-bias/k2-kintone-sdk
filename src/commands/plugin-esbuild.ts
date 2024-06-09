import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { Configuration } from 'webpack';
import { PLUGIN_CONTENTS_DIRECTORY } from '../lib/constants.js';
import { importPluginConfig } from '../lib/import.js';
import { getTailwindConfig, outputCss } from '../lib/tailwind.js';
import { BuildOptions } from 'esbuild';
import { buildWithEsbuild } from '../lib/esbuild.js';

export default function command() {
  program
    .command('esbuild')
    .description("Build the project for production. (It's a wrapper of webpack build command.)")
    .action(action);
}

export async function action() {
  console.group('🍳 Build the project for production');

  try {
    const config = await importPluginConfig();

    if (!fs.existsSync(PLUGIN_CONTENTS_DIRECTORY)) {
      await fs.mkdir(PLUGIN_CONTENTS_DIRECTORY, { recursive: true });
    }

    const entries: Configuration['entry'] = {
      desktop: path.join('src', 'desktop', 'index.ts'),
      config: path.join('src', 'config', 'index.ts'),
    };

    if (config.tailwind?.css && config.tailwind?.config) {
      const tailwindConfig = await getTailwindConfig(config.tailwind);

      const inputFile = path.resolve(config.tailwind.css);
      const inputPath = path.resolve(inputFile);

      await outputCss({
        inputPath,
        outputPath: path.join(PLUGIN_CONTENTS_DIRECTORY, 'config.css'),
        config: tailwindConfig.config,
      });
      console.log('✨ Built config.css');
      await outputCss({
        inputPath,
        outputPath: path.join(PLUGIN_CONTENTS_DIRECTORY, 'desktop.css'),
        config: tailwindConfig.config,
      });
      console.log('✨ Built desktop.css');
    }

    const entryPoints: BuildOptions['entryPoints'] = ['desktop', 'config'].map((dir) => ({
      in: path.join('src', dir, 'index.ts'),
      out: dir,
    }));

    await buildWithEsbuild({
      entryPoints,
      outdir: PLUGIN_CONTENTS_DIRECTORY,
      minify: true,
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
