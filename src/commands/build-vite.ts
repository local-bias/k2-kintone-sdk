import { program } from 'commander';
import { getViteConfig } from '../lib/vite.js';
import { WORKSPACE_DIRECTORY } from '../lib/constants.js';
import path from 'path';
import base from './build-vite-base.js';
import fs from 'fs-extra';

export default function command() {
  program
    .command('build')
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

    const entries = allProjects.reduce<Record<string, string>>((acc, dir) => {
      for (const filename of ['index.ts', 'index.js', 'index.mjs']) {
        if (fs.existsSync(path.join(input, dir, filename))) {
          return { ...acc, [dir]: path.join(input, dir, filename) };
        }
      }
      return acc;
    }, {});

    const viteConfig = getViteConfig({
      build: {
        rollupOptions: {
          input: entries,
          output: {
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]',
          },
        },
        outDir: path.resolve(outdir),
      },
    });

    await base({ viteConfig });

    console.log('✨ Build success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
