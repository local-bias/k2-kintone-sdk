import { program } from 'commander';
import { BuildOptions } from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import {
  DEFAULT_PORT,
  PLUGIN_DEVELOPMENT_DIRECTORY,
  PLUGIN_WORKSPACE_DIRECTORY,
} from '../../lib/constants.js';
import { importK2PluginConfig } from '../../lib/import.js';
import base from '../dev-base-esbuild.js';
import { getManifest } from './create-manifest.js';
import { watchCss } from './tailwind.js';
import { watchContentsAndUploadZip } from './upload.js';

export default function command() {
  program
    .command('dev')
    .option(
      '-p, --ppk <ppk>',
      '.ppk file path',
      path.join(PLUGIN_WORKSPACE_DIRECTORY, 'private.ppk')
    )
    .description('Start development server.')
    .action(action);
}

export async function action(options: { ppk: string }) {
  console.group('🍳 Start development server');
  try {
    const { ppk: ppkPath } = options;
    const config = await importK2PluginConfig();

    if (!fs.existsSync(PLUGIN_DEVELOPMENT_DIRECTORY)) {
      await fs.mkdir(PLUGIN_DEVELOPMENT_DIRECTORY, { recursive: true });
    }

    const port = config.server?.port ?? DEFAULT_PORT;

    const manifest = await getManifest({ config, port });
    console.log(`📝 manifest.json generated`);

    Promise.all([watchContentsAndUploadZip({ manifest, ppkPath }), watchCss(config), build(port)]);
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}

async function build(port: number) {
  const entryPoints: BuildOptions['entryPoints'] = ['desktop', 'config'].map((dir) => ({
    in: path.join('src', dir, 'index.ts'),
    out: dir,
  }));

  base({
    port,
    entryPoints,
    certDir: PLUGIN_WORKSPACE_DIRECTORY,
    staticDir: PLUGIN_DEVELOPMENT_DIRECTORY,
  });
}
