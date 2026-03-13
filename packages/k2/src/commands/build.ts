import { program } from 'commander';
import path from 'path';
import chalk from 'chalk';
import { WORKSPACE_DIRECTORY } from '../lib/constants.js';
import { buildTailwind } from './build-tailwind.js';
import { importK2Config } from '../lib/import.js';
import { getDefaultK2Config } from '../lib/k2.js';
import { buildWithRsbuild, getAppEntryPoints } from '../lib/rsbuild.js';

export default function command() {
  program
    .command('build')
    .option('-o, --outdir <outdir>', 'Output directory.', path.join(WORKSPACE_DIRECTORY, 'prod'))
    .option('-i, --input <input>', 'Input directory.', path.join('src', 'apps'))
    .option('--config <config>', 'k2 config file path')
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

    const k2Config = config ? await importK2Config(config) : getDefaultK2Config();
    const fullConfig: K2.FullConfig = { ...k2Config, outDir };

    const results = await Promise.allSettled([
      buildWithRsbuild({
        entries,
        outDir,
        minify: true,
        sourcemap: false,
        injectStyles: true,
      }),
      buildTailwind(fullConfig),
    ]);

    for (const result of results) {
      if (result.status === 'rejected') {
        throw result.reason;
      }
    }
    console.log('✨ Build success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
