import { program } from 'commander';
import { outputManifest } from '../../lib/manifest.js';
import fs from 'fs-extra';
import path from 'path';
import { WORKSPACE_DIRECTORY } from '../../lib/constants.js';
import packer from '@kintone/plugin-packer';
import {
  getContentsZipBuffer,
  getZipFileNameSuffix,
  outputContentsZip,
} from '../../lib/zip.js';

export default function command(): void {
  program
    .command('zip')
    .description('generate plugin zip')
    .option(
      '-e, --env <env>',
      'plugin environment (dev, prod, standalone)',
      'prod'
    )
    .action(action);
}

async function action(options: { env: string }): Promise<void> {
  console.group('🚀 Executing plugin zip generation');
  try {
    const { env } = options;
    if (env !== 'prod' && env !== 'dev' && env !== 'standalone') {
      throw new Error('Invalid environment');
    }
    if (fs.existsSync(path.join(WORKSPACE_DIRECTORY, 'contents'))) {
      await fs.remove(path.join(WORKSPACE_DIRECTORY, 'contents'));
    }

    await fs.copySync(
      path.join('src', 'contents'),
      path.join(WORKSPACE_DIRECTORY, 'contents'),
      { overwrite: true }
    );
    console.log('📁 contents copied');
    await outputManifest(env);
    console.log(`📝 manifest.json generated (${env})`);

    await outputContentsZip();
    const buffer = await getContentsZipBuffer();
    const privateKeyFile = await fs.readFile(
      path.join(WORKSPACE_DIRECTORY, 'private.ppk')
    );
    const privateKey = privateKeyFile.toString();

    const output = await packer(buffer, privateKey);

    const zipFileName = `plugin${getZipFileNameSuffix(env)}.zip`;

    await fs.writeFile(
      path.join(WORKSPACE_DIRECTORY, zipFileName),
      output.plugin
    );
    console.log('📦 plugin.zip generated');
    console.log(
      `✨ Plugin zip generation completed! zip file path is ./.plugin/${zipFileName}`
    );
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
