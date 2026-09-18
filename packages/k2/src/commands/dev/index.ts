import chalk from 'chalk';
import { program } from 'commander';
import path from 'node:path';
import {
  CONFIG_FILE_NAME,
  DEFAULT_PORT,
  DEVELOPMENT_DIRECTORY,
  WORKSPACE_DIRECTORY,
} from '../../lib/constants.js';
import { startDevServer } from '../../lib/dev-server.js';
import { loadK2Config } from '../../lib/import.js';
import { getAppEntryPoints } from '../../lib/rsbuild.js';
import { watchCss } from './tailwind.js';

export default function command() {
  program
    .command('dev')
    .description('Start development server with rsbuild.')
    .option('-i, --input <input>', 'Input directory', path.join('src', 'apps'))
    .option('-o, --outdir <outdir>', 'Output directory.', DEVELOPMENT_DIRECTORY)
    .option('-c, --certdir <certdir>', 'Certificate directory', WORKSPACE_DIRECTORY)
    .option('--config <config>', `k2 config file path (default: ${CONFIG_FILE_NAME})`)
    .option('-p, --port <port>', 'Port number')
    .action(action);
}

export async function action(options: {
  outdir: string;
  certdir: string;
  port?: string;
  config?: string;
  input: string;
}) {
  const { certdir, outdir, config, port: specifiedPort, input } = options;
  console.group('🍳 Start development server');
  try {
    console.log(`📂 Output directory: ${outdir}`);
    console.log(`🔑 Certificate directory: ${certdir}`);

    const k2Config = await loadK2Config(config);
    if (!k2Config) {
      console.log(`⚙ ${CONFIG_FILE_NAME} not found. use default settings.`);
    }

    const port = Number(specifiedPort ?? k2Config?.server?.port ?? DEFAULT_PORT);
    const outputDir = path.resolve(outdir);

    const entries = getAppEntryPoints(path.resolve(input));
    const entryNames = Object.keys(entries);

    if (entryNames.length === 0) {
      throw new Error(`No entry points found in ${input}`);
    }

    console.log(chalk.gray(`  Entry points: ${entryNames.join(', ')}`));

    await startDevServer({
      entries,
      outDir: outputDir,
      certDir: path.resolve(certdir),
      port,
      title: 'Development server ready!',
    });

    if (k2Config) {
      await watchCss({ k2Config, outdir });
    }
  } finally {
    console.groupEnd();
  }
}
