import { program } from 'commander';
import { generateCert } from '../lib/cert/index.js';
import { PLUGIN_WORKSPACE_DIRECTORY } from '../lib/constants.js';

export default function command() {
  program
    .command('genkey')
    .description('Generate SSL certificate for localhost using node-forge.')
    .option('-o, --output <output>', 'Output directory.', PLUGIN_WORKSPACE_DIRECTORY)
    .action(action);
}

export async function action(options: { output: string }) {
  console.group('🍳 Generate SSL certificate for localhost');
  try {
    generateCert(options.output);
    console.log(`🔑 Certificate generated. Output to ./${options.output}`);
  } finally {
    console.groupEnd();
  }
}
