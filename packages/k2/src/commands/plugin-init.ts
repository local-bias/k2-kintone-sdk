import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { outputManifest } from '../lib/plugin-manifest.js';
import { PLUGIN_WORKSPACE_DIRECTORY } from '../lib/constants.js';
import { createContentsZipFromDir, createPluginZip } from '../lib/zip.js';
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

    const ppkPath = path.join(PLUGIN_WORKSPACE_DIRECTORY, 'private.ppk');
    const contentsZip = createContentsZipFromDir(manifest);
    const { zip, privateKey } = createPluginZip({ ppkPath, contentsZip });

    if (!fs.existsSync(ppkPath)) {
      console.log('🔑 private.ppk generated');
    } else {
      console.log('🔑 private.ppk already exists. The existing private.ppk will be used.');
    }

    await fs.writeFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, 'plugin.zip'), zip);
    console.log('📦 plugin.zip generated');
    console.log('✨ Plugin initialization setup completed! zip file path is ./.plugin/plugin.zip');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
