import { program } from 'commander';
import { importPluginConfig } from '../lib/import.js';
import path from 'path';
import {
  DEFAULT_PORT,
  DEVELOPMENT_DIRECTORY,
  WORKSPACE_DIRECTORY,
} from '../lib/constants.js';
import fs from 'fs-extra';
import { outputManifest } from '../lib/plugin-manifest.js';
import { copyPluginContents } from '../lib/plugin-contents.js';
import chokider from 'chokidar';
import {
  getContentsZipBuffer,
  getZipFileNameSuffix,
  outputContentsZip,
} from '../lib/zip.js';
import packer from '@kintone/plugin-packer';
import { uploadZip } from '../lib/utils.js';
import base from './dev-base.js';
import { BuildOptions } from 'esbuild';

export default function command() {
  program
    .command('dev')
    .description('Start development server.')
    .action(action);
}

export async function action() {
  console.group('🚀 Start development server');
  try {
    const config = await importPluginConfig();

    const port = config.server?.port ?? DEFAULT_PORT;

    const manifest = await outputManifest('dev', {
      config: {
        ...config,
        manifest: {
          ...config.manifest,
          dev: {
            config: {
              ...config.manifest?.dev?.config,
              js: [`https://localhost:${port}/config.js`],
              css: [`https://localhost:${port}/config.css`],
            },
            desktop: {
              ...config.manifest?.dev?.desktop,
              js: [`https://localhost:${port}/desktop.js`],
              css: [`https://localhost:${port}/desktop.css`],
            },
            mobile: {
              ...config.manifest?.dev?.mobile,
              js: [`https://localhost:${port}/desktop.js`],
              css: [`https://localhost:${port}/desktop.css`],
            },
          },
        },
      },
    });
    console.log(`📝 manifest.json generated`);

    const contentsListener = async () => {
      try {
        await copyPluginContents();
        console.log('📁 contents updated');
      } catch (error) {
        console.error('📁 contents update failed');
      }
    };

    await contentsListener();

    const watcher = chokider.watch(['src/contents/**/*'], {
      ignored: /node_modules/,
      persistent: true,
    });

    watcher.on('change', contentsListener);
    watcher.on('add', contentsListener);
    watcher.on('unlink', contentsListener);

    await outputContentsZip(manifest);
    const buffer = await getContentsZipBuffer();
    const pluginPrivateKey = await fs.readFile(
      path.join(WORKSPACE_DIRECTORY, 'private.ppk'),
      'utf8'
    );

    const output = await packer(buffer, pluginPrivateKey);

    const zipFileName = `plugin${getZipFileNameSuffix('dev')}.zip`;

    await fs.writeFile(
      path.join(WORKSPACE_DIRECTORY, zipFileName),
      output.plugin
    );

    uploadZip('dev').then(({ stdout, stderr }) => {
      console.log(stdout);
      console.error(stderr);
    });

    const srcDir = path.join('src', 'apps');
    const dirs = fs.readdirSync(srcDir);

    const entryPoints: BuildOptions['entryPoints'] = dirs.reduce<
      { in: string; out: string }[]
    >((acc, dir) => {
      for (const filename of ['index.ts', 'index.js', 'index.mjs']) {
        if (fs.existsSync(path.join(srcDir, dir, filename))) {
          return [...acc, { in: path.join(srcDir, dir, filename), out: dir }];
        }
      }
      return acc;
    }, []);

    base({
      port,
      entryPoints,
      certDir: WORKSPACE_DIRECTORY,
      staticDir: DEVELOPMENT_DIRECTORY,
    });
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
