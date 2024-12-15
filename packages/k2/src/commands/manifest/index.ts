import { program } from 'commander';
import { outputManifest } from '../../lib/plugin-manifest.js';
import { copyPluginContents } from '../../lib/plugin-contents.js';

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

    await copyPluginContents();
    console.log('📁 contents copied');

    await outputManifest(env);
    console.log(`📝 manifest.json generated (${env})`);
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
