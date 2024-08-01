import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { WORKSPACE_DIRECTORY } from '../lib/constants.js';
import { BuildOptions } from 'esbuild';
import { buildWithEsbuild } from '../lib/esbuild.js';
import { importK2Config } from '../lib/import.js';
import { getDefaultK2Config } from '../lib/k2.js';
import { buildTailwind } from './build-tailwind.js';

export default function command() {
  program
    .command('esbuild-build')
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

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const allProjects = fs.readdirSync(path.resolve(input));

    const entryPoints = allProjects.reduce<NonNullable<BuildOptions['entryPoints']>>((acc, dir) => {
      for (const filename of ['index.ts', 'index.js', 'index.mjs']) {
        if (fs.existsSync(path.join(input, dir, filename))) {
          return { ...acc, [dir]: path.join(input, dir, filename) };
        }
      }
      return acc;
    }, {});

    console.log(`📁 ${Object.keys(entryPoints).length} entry points`);

    const k2Config = config ? await importK2Config(config) : getDefaultK2Config();
    const fullConfig: K2.FullConfig = { ...k2Config, outDir };

    await Promise.allSettled([
      buildWithEsbuild({
        entryPoints,
        outdir,
        sourcemap: false,
        minify: true,
        legalComments: 'none',
      }),
      buildTailwind(fullConfig),
    ]);
    console.log('✨ Build success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
