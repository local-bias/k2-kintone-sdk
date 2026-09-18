import { program } from 'commander';
import fs from 'fs-extra';
import path from 'node:path';
import { PLUGIN_WORKSPACE_DIRECTORY, PRIVATE_KEY_FILE_NAME } from '../lib/constants.js';
import { copyPluginContents } from '../lib/plugin-contents.js';
import { outputManifest } from '../lib/plugin-manifest.js';
import { createContentsZipFromDir, createPluginZip } from '../lib/zip.js';

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

    const ppkPath = path.join(PLUGIN_WORKSPACE_DIRECTORY, PRIVATE_KEY_FILE_NAME);
    const ppkExists = fs.existsSync(ppkPath);

    const contentsZip = createContentsZipFromDir(manifest);
    const { zip } = createPluginZip({ ppkPath, contentsZip });

    console.log(
      ppkExists
        ? `🔑 ${PRIVATE_KEY_FILE_NAME} already exists. The existing ${PRIVATE_KEY_FILE_NAME} will be used.`
        : `🔑 ${PRIVATE_KEY_FILE_NAME} generated`
    );

    await fs.outputFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, 'plugin.zip'), zip);
    console.log('📦 plugin.zip generated');
    console.log('✨ Plugin initialization setup completed! zip file path is ./.plugin/plugin.zip');
  } finally {
    console.groupEnd();
  }
}
