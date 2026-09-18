import { program } from 'commander';
import { copyPluginContents } from '../../lib/plugin-contents.js';
import { outputManifest } from '../../lib/plugin-manifest.js';
import { isEnv } from '../../lib/utils.js';

export default function command(): void {
  program
    .command('manifest')
    .description('generate manifest.json')
    .option('-e, --env <env>', 'plugin environment (dev, prod, standalone)', 'prod')
    .action(action);
}

async function action(options: { env: string }): Promise<void> {
  console.group('🚀 Executing manifest generation');
  try {
    const { env } = options;
    if (!isEnv(env)) {
      throw new Error(`Invalid environment: "${env}". Use one of dev, prod, standalone.`);
    }

    await copyPluginContents();
    console.log('📁 contents copied');

    await outputManifest(env);
    console.log(`📝 manifest.json generated (${env})`);
  } finally {
    console.groupEnd();
  }
}
