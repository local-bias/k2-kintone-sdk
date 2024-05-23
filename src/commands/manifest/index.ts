import { program } from 'commander';
import { outputManifest } from '../../lib/manifest.js';
import fs from 'fs-extra';
import path from 'path';
import { WORKSPACE_DIRECTORY } from '../../lib/constants.js';

export default function command(): void {
  program
    .command('manifest')
    .option('-e, --env <env>', 'create manifest', 'prod')
    .action(action);
}

async function action(options: { env: string }): Promise<void> {
  console.group('🚀 Executing manifest generation');
  try {
    const { env } = options;
    if (env !== 'prod' && env !== 'dev' && env !== 'standalone') {
      throw new Error('Invalid environment');
    }
    await fs.copySync(
      path.join('src', 'contents'),
      path.join(WORKSPACE_DIRECTORY, 'contents'),
      { overwrite: true }
    );
    console.log('📁 contents copied');
    await outputManifest(env);
    console.log(`📝 manifest.json generated (${env})`);
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
