import { program } from 'commander';
import { getViteConfig } from '../lib/vite.js';
import { DEVELOPMENT_DIRECTORY, WORKSPACE_DIRECTORY } from '../lib/constants.js';
import path from 'path';
import { DEFAULT_PORT } from '../lib/constants.js';
import fs from 'fs-extra';
import base from './dev-vite-base.js';

export default function command() {
  program
    .command('vite-dev')
    .description('Start development server.')
    .option('-i, --input <input>', 'Input directory', 'src/apps')
    .option('-o, --outdir <outdir>', 'Output directory.', DEVELOPMENT_DIRECTORY)
    .option('-c, --certdir <certdir>', 'Certificate directory', WORKSPACE_DIRECTORY)
    .option('-p, --port <port>', 'Port number', DEFAULT_PORT.toString())
    .action(action);
}

export async function action(options: {
  certdir: string;
  outdir: string;
  port: string;
  srcdir: string;
}) {
  console.group('🚀 Start development server');
  try {
    const { certdir, outdir, port, srcdir } = options;

    const srcDir = path.resolve(srcdir);
    const dirs = fs.readdirSync(srcDir);

    const entryPoints = dirs.reduce<Record<string, string>>((acc, dir) => {
      for (const filename of ['index.ts', 'index.js', 'index.mjs']) {
        if (fs.existsSync(path.join(srcDir, dir, filename))) {
          return { ...acc, [dir]: path.join(srcDir, dir, filename) };
        }
      }
      return acc;
    }, {});

    const viteConfig = getViteConfig({
      mode: 'development',
      build: {
        rollupOptions: {
          input: entryPoints,
          output: {
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]',
          },
        },
        outDir: path.resolve(outdir),
        sourcemap: 'inline',
        chunkSizeWarningLimit: 8192,
      },
      server: {
        port: Number(port),
        https: {
          key: fs.readFileSync(path.join(certdir, 'localhost-key.pem')),
          cert: fs.readFileSync(path.join(certdir, 'localhost-cert.pem')),
        },
      },
    });

    await base({ viteConfig });
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
