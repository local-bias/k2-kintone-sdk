import { program } from 'commander';
import { WORKSPACE_DIRECTORY } from '../lib/constants.js';
import { generateCert } from '../lib/cert/index.js';

export default function command() {
  program
    .command('genkey')
    .description('Generate SSL certificate for localhost using node-forge.')
    .option('-o, --output <output>', 'Output directory.', WORKSPACE_DIRECTORY)
    .action(action);
}

export async function action(options: { output: string }) {
  const { output } = options;

  console.group('🍳 Generate SSL certificate for localhost');
  try {
    generateCert(output);
    console.log(`🔑 Certificate generated. Output to ./${output}`);
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
