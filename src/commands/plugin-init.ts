import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import packer from '@kintone/plugin-packer';
import { outputManifest } from '../lib/plugin-manifest.js';
import { PLUGIN_WORKSPACE_DIRECTORY } from '../lib/constants.js';
import { getContentsZipBuffer, outputContentsZip } from '../lib/zip.js';
import { copyPluginContents } from '../lib/plugin-contents.js';

export default function command() {
  program.command('init').description('generate private.ppk and kitting config').action(action);
}

export async function action() {
  console.group('🍳 Executing plugin initialization setup');
  try {
    const manifest = await outputManifest('dev');
    console.log('📝 manifest.json generated');

    await copyPluginContents();
    console.log('📁 contents copied');

    let privateKey: string | undefined;
    const keyPath = path.join(PLUGIN_WORKSPACE_DIRECTORY, 'private.ppk');
    if (fs.existsSync(keyPath)) {
      privateKey = await fs.readFile(keyPath, 'utf8');
    }

    await outputContentsZip(manifest);
    const buffer = await getContentsZipBuffer();

    const output = await packer(buffer, privateKey);

    if (!privateKey) {
      await fs.writeFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, 'private.ppk'), output.privateKey);
      console.log('🔑 private.ppk generated');
    } else {
      console.log('🔑 private.ppk already exists. The existing private.ppk will be used.');
    }
    await fs.writeFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, 'plugin.zip'), output.plugin);
    console.log('📦 plugin.zip generated');
    console.log('✨ Plugin initialization setup completed! zip file path is ./.plugin/plugin.zip');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
