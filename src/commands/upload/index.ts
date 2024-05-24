import { program } from 'commander';
import { config } from 'dotenv';
import { isEnv, uploadZip } from '../../lib/utils.js';

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
    if (!isEnv(env)) {
      throw new Error('Invalid environment');
    }
    const { stderr } = await uploadZip(env);
    if (stderr) {
      console.error(JSON.stringify(stderr, null, 2));
    }
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
