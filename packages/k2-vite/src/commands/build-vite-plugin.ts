import { program } from 'commander';
import { getViteConfig } from '../lib/vite.js';
import { PLUGIN_CONTENTS_DIRECTORY } from '../lib/constants.js';
import path from 'path';
import base from './build-vite-base.js';

export default function command() {
  program
    .command('build')
    .description("Build the project for production. (It's a wrapper of Vite build command.)")
    .action(action);
}

export async function action() {
  console.group('🍳 Build the project for production');
  try {
    const viteConfig = getViteConfig({
      build: {
        rollupOptions: {
          input: {
            config: path.join('src', 'config', 'index.ts'),
            desktop: path.join('src', 'desktop', 'index.ts'),
          },
          output: {
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]',
          },
        },
        outDir: PLUGIN_CONTENTS_DIRECTORY,
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
