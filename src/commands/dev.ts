import { program } from 'commander';
import { BuildOptions } from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import {
  DEFAULT_PORT,
  PLUGIN_DEVELOPMENT_DIRECTORY,
  PLUGIN_WORKSPACE_DIRECTORY,
} from '../lib/constants.js';
import { importPluginConfig } from '../lib/import.js';
import base from './dev-base.js';

export default function command() {
  program.command('dev').description('Start development server.').action(action);
}

export async function action() {
  console.group('🚀 Start development server');
  try {
    const config = await importPluginConfig();

    const port = config.server?.port ?? DEFAULT_PORT;

    const srcDir = path.join('src', 'apps');
    const dirs = fs.readdirSync(srcDir);

    const entryPoints: BuildOptions['entryPoints'] = dirs.reduce<{ in: string; out: string }[]>(
      (acc, dir) => {
        for (const filename of ['index.ts', 'index.js', 'index.mjs']) {
          if (fs.existsSync(path.join(srcDir, dir, filename))) {
            return [...acc, { in: path.join(srcDir, dir, filename), out: dir }];
          }
        }
        return acc;
      },
      []
    );

    base({
      port,
      entryPoints,
      certDir: PLUGIN_WORKSPACE_DIRECTORY,
      staticDir: PLUGIN_DEVELOPMENT_DIRECTORY,
    });
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
