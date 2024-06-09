import packer from '@kintone/plugin-packer';
import { copyPluginContents } from '../../lib/plugin-contents.js';
import { getContentsZipBuffer, getZipFileNameSuffix, outputContentsZip } from '../../lib/zip.js';
import fs from 'fs-extra';
import path from 'path';
import { PLUGIN_WORKSPACE_DIRECTORY } from '../../lib/constants.js';
import { uploadZip } from '../../lib/utils.js';
import chokider from 'chokidar';
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
      await outputContentsZip(manifest);
      const buffer = await getContentsZipBuffer();
      const pluginPrivateKey = await fs.readFile(path.resolve(ppkPath), 'utf8');

      const output = await packer(buffer, pluginPrivateKey);

      const zipFileName = `plugin${getZipFileNameSuffix('dev')}.zip`;

      await fs.writeFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, zipFileName), output.plugin);

      console.log(
        chalk.hex('#e5e7eb')(`${new Date().toLocaleTimeString()} `) +
          chalk.cyan(`[upload] `) +
          `start uploading`
      );
      await uploadZip('dev');
      console.log(
        chalk.hex('#e5e7eb')(`${new Date().toLocaleTimeString()} `) +
          chalk.cyan(`[upload] `) +
          `done`
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

  const contentsWatcher = chokider.watch(['src/contents/**/*'], {
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
