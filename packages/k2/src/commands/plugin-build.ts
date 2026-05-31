import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { PLUGIN_CONTENTS_DIRECTORY } from '../lib/constants.js';
import { importK2PluginConfig } from '../lib/import.js';
import { getTailwindInputCss, outputCss } from '../lib/tailwind.js';
import { buildWithRsbuild, getPluginEntryPoints } from '../lib/rsbuild.js';

export default function command() {
  program
    .command('build')
    .description('Build the plugin for production with rsbuild.')
    .action(action);
}

export async function action() {
  console.group('🍳 Build the plugin for production');

  try {
    const config = await importK2PluginConfig();

    if (!fs.existsSync(PLUGIN_CONTENTS_DIRECTORY)) {
      await fs.mkdir(PLUGIN_CONTENTS_DIRECTORY, { recursive: true });
    }

    // Tailwind CSS ビルド
    if (config.tailwind?.css) {
      const inputFile = getTailwindInputCss(config.tailwind);

      await outputCss({
        inputPath: inputFile.config,
        outputPath: path.join(PLUGIN_CONTENTS_DIRECTORY, 'config.css'),
        minify: true,
      });
      console.log('✨ Built config.css');

      await outputCss({
        inputPath: inputFile.desktop,
        outputPath: path.join(PLUGIN_CONTENTS_DIRECTORY, 'desktop.css'),
        minify: true,
      });
      console.log('✨ Built desktop.css');
    }

    // rsbuild でJSビルド
    const entries = getPluginEntryPoints({
      configEntry: path.resolve('src', 'config'),
      desktopEntry: path.resolve('src', 'desktop'),
    });

    const entryNames = Object.keys(entries);
    if (entryNames.length === 0) {
      throw new Error('No entry points found for plugin. Check src/config and src/desktop paths.');
    }

    console.log(chalk.gray(`  Entry points: ${entryNames.join(', ')}`));

    await buildWithRsbuild({
      entries,
      outDir: PLUGIN_CONTENTS_DIRECTORY,
      minify: true,
      sourcemap: false,
      injectStyles: true,
    });

    console.log('✨ Built desktop.js and config.js');
    console.log('✨ Build success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
