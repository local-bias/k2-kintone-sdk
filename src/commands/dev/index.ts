import { program } from 'commander';
import { BuildOptions } from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import {
  CONFIG_FILE_NAME,
  DEFAULT_PORT,
  DEVELOPMENT_DIRECTORY,
  WORKSPACE_DIRECTORY,
} from '../../lib/constants.js';
import base from '../dev-base-esbuild.js';
import { importK2Config } from '../../lib/import.js';
import { watchCss } from './tailwind.js';

export default function command() {
  program
    .command('dev')
    .description('Start development server.')
    .option('-i, --input <input>', 'Input directory', 'src/apps')
    .option('-o, --outdir <outdir>', 'Output directory.', DEVELOPMENT_DIRECTORY)
    .option('-c, --certdir <certdir>', 'Certificate directory', WORKSPACE_DIRECTORY)
    .option('-p, --port <port>', 'Port number')
    .action(action);
}

export async function action(options: {
  outdir: string;
  certdir: string;
  port?: string;
  input: string;
}) {
  const { certdir, outdir, port: specifiedPort, input } = options;
  console.group('🍳 Start development server');
  try {
    console.log(`📂 Output directory: ${outdir}`);
    console.log(`🔑 Certificate directory: ${certdir}`);

    let k2Config: null | K2.Config = null;
    try {
      k2Config = await importK2Config();
    } catch (error) {
      console.log(`⚙ ${CONFIG_FILE_NAME} not found. use default settings.`);
    }

    const port = Number(specifiedPort ?? k2Config?.server?.port ?? DEFAULT_PORT);

    await Promise.all([build({ certdir, outdir, port, input }), watchCss(k2Config?.plugin ?? {})]);
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}

const build = async (params: { outdir: string; certdir: string; port: number; input: string }) => {
  const { outdir, certdir, port, input } = params;

  const srcDir = path.resolve(input);
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

  return base({ port, entryPoints, certDir: certdir, staticDir: outdir });
};
