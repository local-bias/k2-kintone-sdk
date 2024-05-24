import { program } from 'commander';
import { generateCert } from '../../lib/cert.js';
import { WORKSPACE_DIRECTORY } from '../../lib/constants.js';

export default function command() {
  program
    .command('genkey')
    .description('Generate SSL key for localhost. (Require mkcert)')
    .option('-o, --output <output>', 'Output directory.', WORKSPACE_DIRECTORY)
    .action(action);
}

export async function action(options: { output: string }) {
  const { output } = options;

  console.group('🔑 Generate SSL key for localhost');
  try {
    const { stdout } = await generateCert(output);
    console.log(stdout);
    console.log('key generation success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
