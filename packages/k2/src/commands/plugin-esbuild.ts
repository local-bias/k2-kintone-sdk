import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { PLUGIN_CONTENTS_DIRECTORY } from '../lib/constants.js';
import { importK2PluginConfig } from '../lib/import.js';
import { getTailwindConfig, getTailwindInputCss, outputCss } from '../lib/tailwind.js';
import { lint } from '../lib/lint.js';
import { buildEntriesWithVite, getPluginEntryPoints } from '../lib/vite.js';

export default function command() {
  program
    .command('esbuild')
    .description('Build the project for production with Vite. (Legacy command name, now uses Vite)')
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

    // 出力ディレクトリをクリア
    await fs.emptyDir(PLUGIN_CONTENTS_DIRECTORY);

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

    const entries = getPluginEntryPoints({
      configEntry: path.resolve('src', 'config'),
      desktopEntry: path.resolve('src', 'desktop'),
    });

    const entryNames = Object.keys(entries);
    if (entryNames.length === 0) {
      throw new Error('No entry points found for plugin. Check src/config and src/desktop paths.');
    }

    console.log(chalk.gray(`  Entry points: ${entryNames.join(', ')}`));

    await buildEntriesWithVite({
      entries,
      outDir: PLUGIN_CONTENTS_DIRECTORY,
      mode: 'production',
      sourcemap: false,
      minify: true,
    });

    console.log('✨ Built desktop.js and config.js');
    console.log('✨ Build success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
