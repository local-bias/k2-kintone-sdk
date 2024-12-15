import { program } from 'commander';
import base from './genkey-base.js';
import { PLUGIN_WORKSPACE_DIRECTORY } from '../lib/constants.js';

export default function command() {
  program
    .command('genkey')
    .description('Generate SSL key for localhost. (Require mkcert)')
    .action(action);
}

export async function action() {
  await base({ output: PLUGIN_WORKSPACE_DIRECTORY });
}
