import packer from '@kintone/plugin-packer';
import { copyPluginContents } from '../../lib/plugin-contents.js';
import { getContentsZipBuffer, getZipFileNameSuffix, outputContentsZip } from '../../lib/zip.js';
import fs from 'fs-extra';
import path from 'path';
import { PLUGIN_WORKSPACE_DIRECTORY } from '../../lib/constants.js';
import { uploadZip } from '../../lib/utils.js';
import chokider from 'chokidar';

export const watchContentsAndUploadZip = async (params: {
  manifest: Plugin.Meta.Manifest;
  ppkPath: string;
}) => {
  const { manifest, ppkPath } = params;
  const contentsListener = async () => {
    try {
      await copyPluginContents();
      console.log('📁 contents updated');
    } catch (error) {
      console.error('📁 contents update failed');
    }

    await outputContentsZip(manifest);
    const buffer = await getContentsZipBuffer();
    const pluginPrivateKey = await fs.readFile(path.resolve(ppkPath), 'utf8');

    const output = await packer(buffer, pluginPrivateKey);

    const zipFileName = `plugin${getZipFileNameSuffix('dev')}.zip`;

    await fs.writeFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, zipFileName), output.plugin);

    console.log(`📤 uploading ${zipFileName} to your kintone`);
    await uploadZip('dev');
    console.log('📤 Plugin uploaded');
  };

  await contentsListener();

  const contentsWatcher = chokider.watch(['src/contents/**/*'], {
    ignored: /node_modules/,
    persistent: true,
  });

  contentsWatcher.on('change', contentsListener);
  contentsWatcher.on('add', contentsListener);
  contentsWatcher.on('unlink', contentsListener);
};
