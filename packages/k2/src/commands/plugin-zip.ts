import { program } from 'commander';
import { outputManifest } from '../lib/plugin-manifest.js';
import fs from 'fs-extra';
import path from 'path';
import { PLUGIN_WORKSPACE_DIRECTORY } from '../lib/constants.js';
import packer from '@kintone/plugin-packer';
import { getContentsZipBuffer, getZipFileNameSuffix, outputContentsZip } from '../lib/zip.js';
import { copyPluginContents } from '../lib/plugin-contents.js';
import { isEnv } from '../lib/utils.js';

export default function command(): void {
  program
    .command('zip')
    .description('generate plugin zip')
    .option('-e, --env <env>', 'plugin environment (dev, prod, standalone)', 'prod')
    .option(
      '-p, --ppk <ppk>',
      '.ppk file path',
      path.join(PLUGIN_WORKSPACE_DIRECTORY, 'private.ppk')
    )
    .action(action);
}

async function action(options: { env: string; ppk: string }): Promise<void> {
  console.group('🍳 Executing plugin zip generation');
  try {
    const { env, ppk: ppkPath } = options;
    if (!isEnv(env)) {
      throw new Error('Invalid environment');
    }

    await copyPluginContents();
    console.log('📁 contents copied');

    const manifest = await outputManifest(env);
    console.log(`📝 manifest.json generated (${env})`);

    await outputContentsZip(manifest);
    console.log('📦 contents.zip generated');

    const buffer = await getContentsZipBuffer();
    const privateKey = await fs.readFile(path.resolve(ppkPath), 'utf8');

    const output = await packer(buffer, privateKey);

    const zipFileName = `plugin${getZipFileNameSuffix(env)}.zip`;

    await fs.writeFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, zipFileName), output.plugin);
    console.log('📦 plugin.zip generated');

    // version ファイルを出力
    const version = String(manifest.version);
    await fs.writeFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, 'version'), version);
    console.log(`📝 version file generated (${version})`);

    console.log(`✨ Plugin zip generation completed! zip file path is ./.plugin/${zipFileName}`);
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
