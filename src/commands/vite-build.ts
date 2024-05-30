import { program } from 'commander';
import { build } from 'vite';
import { getViteConfig } from '../lib/vite.js';
import { PLUGIN_CONTENTS_DIRECTORY } from '../lib/constants.js';
import path from 'path';

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
      },
    });

    await build({
      ...viteConfig,
      mode: 'production',
      build: { ...viteConfig.build, outDir: PLUGIN_CONTENTS_DIRECTORY },
    });

    console.log('✨ Build success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
