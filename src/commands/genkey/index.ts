import { program } from 'commander';
import { generateCert } from '../../lib/cert.js';

export default function command() {
  program
    .command('genkey')
    .description('Generate SSL key for localhost. (Require mkcert)')
    .action(action);
}

export async function action() {
  console.group('🔑 Generate SSL key for localhost');
  try {
    const { stdout } = await generateCert();
    console.log(stdout);
    console.log('key generation success.');
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
