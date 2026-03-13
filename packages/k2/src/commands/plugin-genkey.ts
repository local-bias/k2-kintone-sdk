import { program } from 'commander';
import { PLUGIN_WORKSPACE_DIRECTORY } from '../lib/constants.js';
import { generateCert } from '../lib/cert/index.js';

export default function command() {
  program
    .command('genkey')
    .description('Generate SSL certificate for localhost using node-forge.')
    .action(action);
}

export async function action() {
  console.group('🍳 Generate SSL certificate for localhost');
  try {
    generateCert(PLUGIN_WORKSPACE_DIRECTORY);
    console.log(`🔑 Certificate generated. Output to ./${PLUGIN_WORKSPACE_DIRECTORY}`);
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
