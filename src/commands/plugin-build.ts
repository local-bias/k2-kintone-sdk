import { program } from 'commander';
import { PLUGIN_CONTENTS_DIRECTORY } from '../lib/constants.js';
import path from 'path';
import { Configuration } from 'webpack';
import base from './build-base.js';

export default function command() {
  program
    .command('build')
    .description("Build the project for production. (It's a wrapper of webpack build command.)")
    .action(action);
}

export async function action() {
  console.group('🍳 Build the project for production');

  try {
    const entries: Configuration['entry'] = {
      desktop: path.join('src', 'desktop', 'index.ts'),
      config: path.join('src', 'config', 'index.ts'),
    };

    await base({ entries, outDir: PLUGIN_CONTENTS_DIRECTORY });
    console.log('✨ Build success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
