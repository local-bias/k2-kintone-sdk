import { program } from 'commander';
import { importPluginConfig } from '../lib/import.js';
import { PLUGIN_CONTENTS_DIRECTORY } from '../lib/constants.js';
import { buildWithWebpack } from '../lib/webpack.js';
import path from 'path';

export default function command() {
  program
    .command('build')
    .description("Build the project for production. (It's a wrapper of webpack build command.)")
    .action(action);
}

export async function action() {
  console.group('🍳 Build the project for production');
  try {
    await buildWithWebpack({
      mode: 'plugin',
      srcRoot: path.resolve('src'),
      distRoot: PLUGIN_CONTENTS_DIRECTORY,
    });
    console.log('✨ Build success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
