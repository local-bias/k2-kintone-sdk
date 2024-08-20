import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { WORKSPACE_DIRECTORY } from '../lib/constants.js';
import base from './build-base.js';
import { buildTailwind } from './build-tailwind.js';
import { importK2Config } from '../lib/import.js';
import { getDefaultK2Config } from '../lib/k2.js';

export default function command() {
  program
    .command('build')
    .option('-o, --outdir <outdir>', 'Output directory.', path.join(WORKSPACE_DIRECTORY, 'prod'))
    .option('-i, --input <input>', 'Input directory.', path.join('src', 'apps'))
    .option('--config <config>', 'k2 config file path')
    .description("Build the project for production. (It's a wrapper of webpack build command.)")
    .action(action);
}

export async function action(options: { outdir: string; input: string; config?: string }) {
  console.group('🍳 Build the project for production');

  try {
    const { outdir, input, config } = options;
    const outDir = path.resolve(outdir);

    const allProjects = fs.readdirSync(path.resolve(input));

    const entries = allProjects.reduce<Record<string, string>>((acc, dir) => {
      for (const filename of ['index.ts', 'index.js', 'index.mjs']) {
        if (fs.existsSync(path.join(input, dir, filename))) {
          return { ...acc, [dir]: path.join(input, dir, filename) };
        }
      }
      return acc;
    }, {});

    const k2Config = config ? await importK2Config(config) : getDefaultK2Config();
    const fullConfig: K2.FullConfig = { ...k2Config, outDir };

    const results = await Promise.allSettled([
      base({ entries, outDir }),
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
