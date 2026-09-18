import chalk from 'chalk';
import { program } from 'commander';
import fs from 'fs-extra';
import path from 'node:path';
import { PLUGIN_CONTENTS_DIRECTORY } from '../lib/constants.js';
import { importK2PluginConfig } from '../lib/import.js';
import { buildWithRsbuild, getPluginEntryPoints } from '../lib/rsbuild.js';
import { getTailwindInputCss, outputCss } from '../lib/tailwind.js';

/** プラグインのエントリーポイントとなるディレクトリ */
export const PLUGIN_ENTRY_DIRS = {
  configEntry: path.join('src', 'config'),
  desktopEntry: path.join('src', 'desktop'),
} as const;

export const resolvePluginEntryPoints = () =>
  getPluginEntryPoints({
    configEntry: path.resolve(PLUGIN_ENTRY_DIRS.configEntry),
    desktopEntry: path.resolve(PLUGIN_ENTRY_DIRS.desktopEntry),
  });

/**
 * エントリーポイントを解決し、1件も見つからなければエラーにします
 */
export const resolvePluginEntryPointsOrThrow = (): Record<string, string> => {
  const entries = resolvePluginEntryPoints();

  if (Object.keys(entries).length === 0) {
    throw new Error(
      `No entry points found for plugin. Check ${PLUGIN_ENTRY_DIRS.configEntry} and ${PLUGIN_ENTRY_DIRS.desktopEntry} paths.`
    );
  }

  console.log(chalk.gray(`  Entry points: ${Object.keys(entries).join(', ')}`));

  return entries;
};

export default function command() {
  program
    .command('build')
    .description('Build the plugin for production with rsbuild.')
    .action(action);
}

async function buildTailwind(config: Plugin.Meta.Config): Promise<void> {
  if (!config.tailwind?.css) {
    return;
  }

  const inputFile = getTailwindInputCss(config.tailwind);

  for (const [name, inputPath] of [
    ['config.css', inputFile.config],
    ['desktop.css', inputFile.desktop],
  ] as const) {
    await outputCss({
      inputPath,
      outputPath: path.join(PLUGIN_CONTENTS_DIRECTORY, name),
      minify: true,
    });
    console.log(`✨ Built ${name}`);
  }
}

export async function action() {
  console.group('🍳 Build the plugin for production');

  try {
    const config = await importK2PluginConfig();

    await fs.ensureDir(PLUGIN_CONTENTS_DIRECTORY);

    const entries = resolvePluginEntryPointsOrThrow();

    // rsbuild は出力先を一度クリーンするため、CSSの出力より先に実行する必要があります
    await buildWithRsbuild({
      entries,
      outDir: PLUGIN_CONTENTS_DIRECTORY,
      minify: true,
      sourcemap: false,
      injectStyles: true,
    });

    console.log('✨ Built desktop.js and config.js');

    await buildTailwind(config);
    console.log('✨ Build success.');
  } finally {
    console.groupEnd();
  }
}
