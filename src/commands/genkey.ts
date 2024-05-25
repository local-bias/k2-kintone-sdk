import { program } from 'commander';
import base from './genkey-base.js';
import { WORKSPACE_DIRECTORY } from '../lib/constants.js';

export default function command() {
  program
    .command('genkey')
    .description('Generate SSL key for localhost. (Require mkcert)')
    .option('-o, --output <output>', 'Output directory.', WORKSPACE_DIRECTORY)
    .action(action);
}

export async function action(options: { output: string }) {
  await base(options);
}
