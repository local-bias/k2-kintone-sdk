import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import packer from '@kintone/plugin-packer';
import { outputManifest } from '../../lib/manifest.js';
import { WORKSPACE_DIRECTORY } from '../../lib/constants.js';
import { getContentsZipBuffer, outputContentsZip } from '../../lib/zip.js';

export default function command() {
  program
    .command('init')
    .description('generate private.ppk and kitting config')
    .action(action);
}

export async function action() {
  console.group('🚀 Executing plugin initialization setup');
  try {
    await outputManifest('dev');
    console.log('📝 manifest.json generated');

    await fs.copySync(
      path.join('src', 'contents'),
      path.join(WORKSPACE_DIRECTORY, 'contents'),
      { overwrite: true }
    );
    console.log('📁 contents copied');

    await outputContentsZip();
    const buffer = await getContentsZipBuffer();

    const output = await packer(buffer);

    await fs.writeFile(
      path.join(WORKSPACE_DIRECTORY, 'private.ppk'),
      output.privateKey
    );
    await fs.writeFile(
      path.join(WORKSPACE_DIRECTORY, 'plugin.zip'),
      output.plugin
    );
    console.log('🔐 private.ppk and plugin.zip generated');
    console.log(
      '✨ Plugin initialization setup completed! zip file path is ./.plugin/plugin.zip'
    );
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
