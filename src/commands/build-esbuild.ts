import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { WORKSPACE_DIRECTORY } from '../lib/constants.js';
import { BuildOptions } from 'esbuild';
import { buildWithEsbuild } from '../lib/esbuild.js';

export default function command() {
  program
    .command('esbuild-build')
    .option('-o, --outdir <outdir>', 'Output directory.', path.join(WORKSPACE_DIRECTORY, 'prod'))
    .option('-i, --input <input>', 'Input directory.', path.join('src', 'apps'))
    .description("Build the project for production. (It's a wrapper of webpack build command.)")
    .action(action);
}

export async function action(options: { outdir: string; input: string }) {
  console.group('🍳 Build the project for production');

  try {
    const { outdir, input } = options;

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

    await buildWithEsbuild({
      entryPoints,
      outdir,
      sourcemap: false,
      minify: true,
      target: 'es2020',
    });
    console.log('✨ Build success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
