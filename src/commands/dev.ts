import { program } from 'commander';
import { BuildOptions } from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import { DEFAULT_PORT, DEVELOPMENT_DIRECTORY, WORKSPACE_DIRECTORY } from '../lib/constants.js';
import base from './dev-base.js';

export default function command() {
  program
    .command('dev')
    .description('Start development server.')
    .option('-o, --outdir <outdir>', 'Output directory.', DEVELOPMENT_DIRECTORY)
    .option('-c, --certdir <certdir>', 'Certificate directory', WORKSPACE_DIRECTORY)
    .option('-p, --port <port>', 'Port number', DEFAULT_PORT.toString())
    .action(action);
}

export async function action(options: { outdir: string; certdir: string; port: string }) {
  const { certdir, outdir, port } = options;
  console.group('🍳 Start development server');
  try {
    console.log(`📂 Output directory: ${outdir}`);
    console.log(`🔑 Certificate directory: ${certdir}`);

    const srcDir = path.join('src', 'apps');
    const dirs = fs.readdirSync(srcDir);

    const entryPoints: BuildOptions['entryPoints'] = dirs.reduce<{ in: string; out: string }[]>(
      (acc, dir) => {
        for (const filename of ['index.ts', 'index.js', 'index.mjs']) {
          if (fs.existsSync(path.join(srcDir, dir, filename))) {
            return [...acc, { in: path.join(srcDir, dir, filename), out: dir }];
          }
        }
        return acc;
      },
      []
    );

    await base({
      port: Number(port),
      entryPoints,
      certDir: certdir,
      staticDir: outdir,
    });
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
