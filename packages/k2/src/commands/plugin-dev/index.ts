import { program } from 'commander';
import path from 'node:path';
import {
  DEFAULT_PORT,
  PLUGIN_DEVELOPMENT_DIRECTORY,
  PLUGIN_WORKSPACE_DIRECTORY,
  PRIVATE_KEY_FILE_NAME,
} from '../../lib/constants.js';
import { startDevServer } from '../../lib/dev-server.js';
import { importK2PluginConfig } from '../../lib/import.js';
import { resolvePluginEntryPointsOrThrow } from '../plugin-build.js';
import { getManifest } from './create-manifest.js';
import { watchCss } from './tailwind.js';
import { watchContentsAndUploadZip } from './upload.js';

export default function command() {
  program
    .command('dev')
    .description('Start development server with rsbuild.')
    .option(
      '-p, --ppk <ppk>',
      '.ppk file path',
      path.join(PLUGIN_WORKSPACE_DIRECTORY, PRIVATE_KEY_FILE_NAME)
    )
    .option('-c, --cert-dir <certDir>', 'Certificate directory', PLUGIN_WORKSPACE_DIRECTORY)
    .action(action);
}

export async function action(options: { ppk: string; certDir: string }) {
  console.group('🍳 Start development server');
  try {
    const { ppk: ppkPath, certDir } = options;
    const config = await importK2PluginConfig();

    const outputDir = path.resolve(PLUGIN_DEVELOPMENT_DIRECTORY);
    const port = config.server?.port ?? DEFAULT_PORT;

    const manifest = await getManifest({ config, port });
    console.log('📝 manifest.json generated');

    const entries = resolvePluginEntryPointsOrThrow();

    await startDevServer({
      entries,
      outDir: outputDir,
      certDir: path.resolve(certDir),
      port,
      title: 'Plugin development server ready!',
      extraLines: ['Files: config.js, desktop.js'],
    });

    // コンテンツ監視+アップロードとTailwindCSS監視は互いに独立しているため並行して開始します
    await Promise.all([watchContentsAndUploadZip({ manifest, ppkPath }), watchCss(config)]);
  } finally {
    console.groupEnd();
  }
}
