import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { WORKSPACE_DIRECTORY } from '../../lib/constants.js';
import { exec } from '../../lib/exec.js';

export default function command() {
  program
    .command('genkey')
    .description('Generate SSL key for localhost. (Require mkcert)')
    .action(action);
}

export async function action() {
  console.group('🔑 Generate SSL key for localhost');
  try {
    const { stdout } = await exec(`mkcert localhost`);
    console.log(stdout);
    console.log('key generation success.');

    [
      { input: 'localhost.pem', output: 'localhost-cert.pem' },
      { input: 'localhost-key.pem', output: 'localhost-key.pem' },
    ].forEach(({ input, output }) => {
      fs.moveSync(`./${input}`, path.join(WORKSPACE_DIRECTORY, output), {
        overwrite: true,
      });
    });
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
