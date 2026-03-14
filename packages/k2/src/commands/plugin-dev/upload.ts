import { copyPluginContents } from '../../lib/plugin-contents.js';
import { createContentsZipFromDir, createPluginZip, getZipFileNameSuffix } from '../../lib/zip.js';
import { uploadPlugin } from '../../lib/kintone-api-client.js';
import fs from 'fs-extra';
import path from 'path';
import { PLUGIN_WORKSPACE_DIRECTORY } from '../../lib/constants.js';
import chokidar from 'chokidar';
import chalk from 'chalk';

export const watchContentsAndUploadZip = async (params: {
  manifest: Plugin.Meta.Manifest;
  ppkPath: string;
}) => {
  const { manifest, ppkPath } = params;

  let initialScanComplete = false;

  const contentsListener = async () => {
    try {
      if (!initialScanComplete) {
        return;
      }
      await copyPluginContents();
      console.log(
        chalk.hex('#e5e7eb')(`${new Date().toLocaleTimeString()} `) +
          chalk.cyan(`[contents] `) +
          `updated`
      );
    } catch (error: any) {
      console.error('Error copying plugin contents:', error);
      return;
    }

    try {
      const contentsZip = createContentsZipFromDir(manifest);
      const { zip, id: pluginId } = createPluginZip({
        ppkPath: path.resolve(ppkPath),
        contentsZip,
      });

      const zipFileName = `plugin${getZipFileNameSuffix('dev')}.zip`;
      await fs.writeFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, zipFileName), zip);

      const { method } = await uploadPlugin({
        pluginId,
        file: { name: zipFileName, data: zip },
      });

      console.log(
        chalk.hex('#e5e7eb')(`${new Date().toLocaleTimeString()} `) +
          chalk.cyan(`[upload] `) +
          `uploaded ${method === 'POST' ? '(new)' : '(update)'}`
      );
    } catch (error: any) {
      console.log(
        chalk.hex('#e5e7eb')(`${new Date().toLocaleTimeString()} `) +
          chalk.cyan(`[upload] `) +
          chalk.red(`failed`) +
          chalk.hex('#e5e7eb')(`: ${error?.message ?? 'Unknown error'}`)
      );
    }
  };

  const contentsWatcher = chokidar.watch(['src/contents/**/*'], {
    ignored: /node_modules/,
    persistent: true,
  });

  contentsWatcher.on('ready', () => {
    initialScanComplete = true;
    contentsListener();
  });

  contentsWatcher.on('change', contentsListener);
  contentsWatcher.on('add', contentsListener);
  contentsWatcher.on('unlink', contentsListener);
};
