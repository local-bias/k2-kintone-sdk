import { program } from 'commander';
import base from './genkey-base.js';

export default function command() {
  program
    .command('genkey')
    .description('Generate SSL key for localhost. (Require mkcert)')
    .option('-o, --output <output>', 'Output directory.', '.k2')
    .action(action);
}

export async function action(options: { output: string }) {
  await base(options);
}
