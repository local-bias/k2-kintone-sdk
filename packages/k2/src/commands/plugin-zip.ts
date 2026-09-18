import { program } from 'commander';
import fs from 'fs-extra';
import path from 'node:path';
import { PLUGIN_WORKSPACE_DIRECTORY, PRIVATE_KEY_FILE_NAME } from '../lib/constants.js';
import { copyPluginContents } from '../lib/plugin-contents.js';
import { outputManifest } from '../lib/plugin-manifest.js';
import { isEnv, writePluginZip } from '../lib/utils.js';

export default function command(): void {
  program
    .command('zip')
    .description('generate plugin zip')
    .option('-e, --env <env>', 'plugin environment (dev, prod, standalone)', 'prod')
    .option(
      '-p, --ppk <ppk>',
      '.ppk file path',
      path.join(PLUGIN_WORKSPACE_DIRECTORY, PRIVATE_KEY_FILE_NAME)
    )
    .action(action);
}

async function action(options: { env: string; ppk: string }): Promise<void> {
  console.group('🍳 Executing plugin zip generation');
  try {
    const { env, ppk: ppkPath } = options;
    if (!isEnv(env)) {
      throw new Error(`Invalid environment: "${env}". Use one of dev, prod, standalone.`);
    }

    await copyPluginContents();
    console.log('📁 contents copied');

    const manifest = await outputManifest(env);
    console.log(`📝 manifest.json generated (${env})`);

    const { pluginId, zipFileName } = await writePluginZip({ env, manifest, ppkPath });
    console.log('📦 plugin.zip generated');

    const version = String(manifest.version);
    await fs.outputFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, 'version'), version);
    console.log(`📝 version file generated (${version})`);

    console.log(
      `✨ Plugin zip generation completed! zip file path is ./${path.join(PLUGIN_WORKSPACE_DIRECTORY, zipFileName)}`
    );
    console.log(`   Plugin ID: ${pluginId}`);
  } finally {
    console.groupEnd();
  }
}
