import { program } from 'commander';
import { importPluginConfig } from '../../lib/import.js';
import express from 'express';
import { createServer } from 'https';
import path from 'path';
import { DEFAULT_PORT, WORKSPACE_DIRECTORY } from '../../lib/constants.js';
import fs from 'fs-extra';
import { outputManifest } from '../../lib/manifest.js';
import { copyPluginContents } from '../../lib/plugin-contents.js';
import chokider from 'chokidar';

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

    await outputManifest('dev', {
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

    const app = express();

    app.use(express.static(path.join(WORKSPACE_DIRECTORY, 'dev')));

    const privateKey = fs.readFileSync(
      path.join(WORKSPACE_DIRECTORY, 'localhost-key.pem')
    );
    const certificate = fs.readFileSync(
      path.join(WORKSPACE_DIRECTORY, 'localhost-cert.pem')
    );

    const server = createServer({ key: privateKey, cert: certificate }, app);

    const res = server.listen(port);

    res.on('error', (error) => {
      console.error(error);
    });
    res.on('listening', () => {
      console.log(`🚀 Server started! https://localhost:${port}`);
    });
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
