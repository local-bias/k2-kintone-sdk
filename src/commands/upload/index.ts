import { program } from 'commander';
import { WORKSPACE_DIRECTORY } from '../../lib/constants.js';
import { getZipFileNameSuffix } from '../../lib/zip.js';
import { config } from 'dotenv';
import { exec } from '../../lib/exec.js';

export default function command(): void {
  program
    .command('upload')
    .description('upload plugin.zip to your kintone')
    .option(
      '-e, --env <env>',
      'plugin environment (dev, prod, standalone)',
      'prod'
    )
    .action(action);
}

async function action(options: { env: string }): Promise<void> {
  console.group('🚀 Uploading plugin.zip to your kintone');
  try {
    config();
    const { env } = options;

    const {
      KINTONE_BASE_URL,
      KINTONE_USERNAME,
      KINTONE_PASSWORD,
      KINTONE_BASIC_AUTH_USERNAME = '',
      KINTONE_BASIC_AUTH_PASSWORD = '',
    } = process.env;
    if (!KINTONE_BASE_URL || !KINTONE_USERNAME || !KINTONE_PASSWORD) {
      throw new Error(`.envの設定が不十分です。以下のパラメータは必須です
KINTONE_BASE_URL
KINTONE_USERNAME
KINTONE_PASSWORD
      `);
    }

    const zipFileName = `plugin${getZipFileNameSuffix(env)}.zip`;

    let command = `kintone-plugin-uploader ${WORKSPACE_DIRECTORY}/${zipFileName} --base-url ${KINTONE_BASE_URL} --username ${KINTONE_USERNAME} --password ${KINTONE_PASSWORD}`;
    if (KINTONE_BASIC_AUTH_USERNAME && KINTONE_BASIC_AUTH_PASSWORD) {
      command += ` --basic-auth-username ${KINTONE_BASIC_AUTH_USERNAME} --basic-auth-password ${KINTONE_BASIC_AUTH_PASSWORD}`;
    }
    command += ' --watch --waiting-dialog-ms 3000';

    const { stderr } = await exec(command);
    if (stderr) {
      console.error(JSON.stringify(stderr, null, 2));
    }
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
