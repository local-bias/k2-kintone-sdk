import chalk from 'chalk';
import { program } from 'commander';
import path from 'node:path';
import { CONFIG_FILE_NAME, PRODUCTION_DIRECTORY } from '../lib/constants.js';
import { loadK2Config } from '../lib/import.js';
import { getDefaultK2Config } from '../lib/k2.js';
import { buildWithRsbuild, getAppEntryPoints } from '../lib/rsbuild.js';
import { buildTailwind } from './build-tailwind.js';

export default function command() {
  program
    .command('build')
    .option('-o, --outdir <outdir>', 'Output directory.', PRODUCTION_DIRECTORY)
    .option('-i, --input <input>', 'Input directory.', path.join('src', 'apps'))
    .option('--config <config>', `k2 config file path (default: ${CONFIG_FILE_NAME})`)
    .description('Build the project for production with rsbuild.')
    .action(action);
}

export async function action(options: { outdir: string; input: string; config?: string }) {
  console.group('🍳 Build the project for production');

  try {
    const { outdir, input, config } = options;
    const outDir = path.resolve(outdir);

    const entries = getAppEntryPoints(path.resolve(input));
    const entryNames = Object.keys(entries);

    if (entryNames.length === 0) {
      throw new Error(`No entry points found in ${input}`);
    }

    console.log(chalk.gray(`  Entry points: ${entryNames.join(', ')}`));

    const k2Config = (await loadK2Config(config)) ?? getDefaultK2Config();
    const fullConfig: K2.FullConfig = { ...k2Config, outDir };

    // rsbuild は出力先を一度クリーンするため、CSSの出力より先に実行する必要があります
    await buildWithRsbuild({ entries, outDir, minify: true, sourcemap: false, injectStyles: true });
    await buildTailwind(fullConfig);

    console.log('✨ Build success.');
  } finally {
    console.groupEnd();
  }
}
