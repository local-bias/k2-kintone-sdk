import { program } from 'commander';
import { lint } from '../lib/lint.js';

export default function command() {
  program
    .command('lint')
    .description('Lint source files')
    .option('-c, --config <config>', 'Config file path')
    .action(action);
}

export async function action(options: {
  outdir: string;
  certdir: string;
  port: string;
  input: string;
}) {
  try {
    lint();
  } catch (error) {
    throw error;
  } finally {
  }
}
