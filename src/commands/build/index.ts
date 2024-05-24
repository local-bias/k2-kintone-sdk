import { program } from 'commander';
import { build } from 'vite';
import { importPluginConfig } from '../../lib/import.js';
import { getViteConfig } from '../../lib/vite.js';
import { CONTENTS_DIRECTORY } from '../../lib/constants.js';

export default function command() {
  program
    .command('build')
    .description(
      "Build the project for production. (It's a wrapper of Vite build command.)"
    )
    .action(action);
}

export async function action() {
  console.group('🚀 Build the project for production');
  try {
    const config = await importPluginConfig();

    const viteConfig = getViteConfig(config);

    await build({
      ...viteConfig,
      mode: 'production',
      build: { ...viteConfig.build, outDir: CONTENTS_DIRECTORY },
    });

    console.log('✨ Build success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
