import { program } from 'commander';
import { createServer } from 'vite';
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
import { generateCert, hasCertificates, loadCertificates } from '../../lib/cert.js';
import { createViteConfig, buildEntriesWithVite, getEntryPointsFromDir } from '../../lib/vite.js';

export default function command() {
  program
    .command('dev')
    .description('Start development server with Vite.')
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

    // SSL証明書の確認
    if (!hasCertificates(certDirPath)) {
      console.log(chalk.yellow('📜 SSL certificates not found. Generating...'));
      try {
        await generateCert(certDirPath);
        console.log(chalk.green('✅ SSL certificates generated successfully'));
      } catch (error) {
        console.log(
          chalk.red('❌ Failed to generate SSL certificates. Make sure mkcert is installed.')
        );
        console.log(chalk.gray('   Install mkcert: https://github.com/FiloSottile/mkcert'));
        throw error;
      }
    }

    const entries = getEntryPointsFromDir(inputDir);
    const entryNames = Object.keys(entries);

    if (entryNames.length === 0) {
      throw new Error(`No entry points found in ${input}`);
    }

    console.log(chalk.gray(`  Entry points: ${entryNames.join(', ')}`));

    await fs.emptyDir(outputDir);

    const { key, cert } = loadCertificates(certDirPath);

    // 初回ビルド
    console.log(chalk.gray('  Building...'));
    await buildEntriesWithVite({
      entries,
      outDir: outputDir,
      mode: 'development',
      sourcemap: 'inline',
      minify: false,
    });

    // 開発サーバー起動
    const serverConfig = createViteConfig({
      root: outputDir,
      server: {
        port,
        https: { key, cert },
      },
    });

    const server = await createServer(serverConfig);
    await server.listen();

    console.log(chalk.green(`\n✨ Development server ready!`));
    console.log(chalk.cyan(`   Local: https://localhost:${port}`));
    console.log(chalk.gray(`   Output: ${outputDir}`));
    console.log(chalk.gray('\n   Watching for changes...\n'));

    // ファイル監視してビルド
    const chokidar = await import('chokidar');
    // chokidar v4ではディレクトリを直接監視
    const watchDirs = [inputDir, path.resolve('src', 'lib')].filter((dir) => fs.existsSync(dir));

    console.log(chalk.gray(`  Watching directories: ${watchDirs.join(', ')}`));

    const watcher = chokidar.watch(watchDirs, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true,
    });

    // 監視対象の拡張子
    const watchExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'];
    const shouldRebuild = (filePath: string) => {
      const ext = path.extname(filePath).toLowerCase();
      return watchExtensions.includes(ext);
    };

    const rebuild = async () => {
      console.log(chalk.gray(`  ${new Date().toLocaleTimeString()} Rebuilding...`));
      await buildEntriesWithVite({
        entries,
        outDir: outputDir,
        mode: 'development',
        sourcemap: 'inline',
        minify: false,
      });
      console.log(chalk.gray(`  ${new Date().toLocaleTimeString()} Rebuild complete`));
    };

    watcher.on('ready', () => {
      console.log(chalk.green('  ✓ File watcher ready'));
    });

    watcher.on('change', (filePath) => {
      if (shouldRebuild(filePath)) {
        console.log(chalk.cyan(`  [change] ${filePath}`));
        rebuild();
      }
    });

    watcher.on('add', (filePath) => {
      if (shouldRebuild(filePath)) {
        console.log(chalk.cyan(`  [add] ${filePath}`));
        rebuild();
      }
    });

    watcher.on('unlink', (filePath) => {
      if (shouldRebuild(filePath)) {
        console.log(chalk.cyan(`  [unlink] ${filePath}`));
        rebuild();
      }
    });

    watcher.on('error', (error) => {
      console.error(chalk.red(`  Watcher error: ${error}`));
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
