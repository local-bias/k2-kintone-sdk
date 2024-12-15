import { program } from 'commander';
import fs from 'fs-extra';
import { esmImport } from '../../lib/import.js';

export default function command() {
  program.command('test').description('test').action(action);
}

export async function action() {
  console.group('package.json');
  const packageJson = fs.readJSONSync('package.json');
  console.log('package.json detected');
  console.groupEnd();

  console.group('Config');
  const config = await esmImport('plugin.config.mjs');
  console.log('plugin.config.mjs detected', config);
  console.groupEnd();
}
