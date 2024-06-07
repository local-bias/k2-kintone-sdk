import { program } from 'commander';
import { importPluginConfig } from '../../lib/import.js';
import path from 'path';
import {
  DEFAULT_PORT,
  PLUGIN_DEVELOPMENT_DIRECTORY,
  PLUGIN_WORKSPACE_DIRECTORY,
} from '../../lib/constants.js';
import base from '../dev-base-esbuild.js';
import { BuildOptions } from 'esbuild';
import { getManifest } from './create-manifest.js';
import { watchContentsAndUploadZip } from './upload.js';
import { watchCss } from './tailwind.js';

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
    const config = await importPluginConfig();

    const port = config.server?.port ?? DEFAULT_PORT;

    const manifest = await getManifest({ config, port });
    console.log(`📝 manifest.json generated`);

    Promise.all([
      watchContentsAndUploadZip({ manifest, ppkPath }),
      watchCss(config),
      async () => {
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
      },
    ]);
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
