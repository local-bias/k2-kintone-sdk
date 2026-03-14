import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import {
  CONFIG_FILE_NAME,
  DEFAULT_PORT,
  DEVELOPMENT_DIRECTORY,
  WORKSPACE_DIRECTORY,
} from '../../lib/constants.js';
import { importK2Config } from '../../lib/import.js';
import { watchCss } from './tailwind.js';
import { generateCert, hasCertificates, loadCertificates } from '../../lib/cert/index.js';
import { startRsbuildDevServer, getAppEntryPoints } from '../../lib/rsbuild.js';

export default function command() {
  program
    .command('dev')
    .description('Start development server with rsbuild.')
    .option('-i, --input <input>', 'Input directory', 'src/apps')
    .option('-o, --outdir <outdir>', 'Output directory.', DEVELOPMENT_DIRECTORY)
    .option('-c, --certdir <certdir>', 'Certificate directory', WORKSPACE_DIRECTORY)
    .option('--config <config>', 'k2 config file path')
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

    let k2Config: null | K2.Config = null;
    try {
      k2Config = await importK2Config(config);
    } catch (error) {
      console.log(`⚙ ${CONFIG_FILE_NAME} not found. use default settings.`);
    }

    const port = Number(specifiedPort ?? k2Config?.server?.port ?? DEFAULT_PORT);
    const certDirPath = path.resolve(certdir);
    const outputDir = path.resolve(outdir);
    const inputDir = path.resolve(input);

    // SSL証明書の確認・生成 (node-forge使用、mkcert不要)
    if (!hasCertificates(certDirPath)) {
      console.log(chalk.yellow('📜 SSL certificates not found. Generating with node-forge...'));
      try {
        generateCert(certDirPath);
        console.log(chalk.green('✅ SSL certificates generated successfully'));
      } catch (error) {
        console.log(chalk.red('❌ Failed to generate SSL certificates.'));
        throw error;
      }
    }

    const entries = getAppEntryPoints(inputDir);
    const entryNames = Object.keys(entries);

    if (entryNames.length === 0) {
      throw new Error(`No entry points found in ${input}`);
    }

    console.log(chalk.gray(`  Entry points: ${entryNames.join(', ')}`));

    const { key, cert } = loadCertificates(certDirPath);

    // rsbuild 開発サーバー起動 (ビルド + ファイル監視 + 配信を自動で行う)
    const { port: actualPort } = await startRsbuildDevServer({
      entries,
      outDir: outputDir,
      port,
      https: { key, cert },
      publicDir: outputDir,
      onFirstCompile: () => {
        console.log(chalk.green(`\n✨ Development server ready!`));
        console.log(chalk.cyan(`   Local: https://localhost:${actualPort}`));
        console.log(chalk.gray(`   Output: ${outputDir}`));
        console.log(chalk.gray('\n   Watching for changes...\n'));
      },
      onRecompile: () => {
        console.log(
          chalk.hex('#e5e7eb')(`${new Date().toLocaleTimeString()} `) +
            chalk.cyan(`[rsbuild] `) +
            `rebuild complete`
        );
      },
    });

    // TailwindCSS監視
    if (k2Config) {
      await watchCss({ k2Config, outdir });
    }
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
