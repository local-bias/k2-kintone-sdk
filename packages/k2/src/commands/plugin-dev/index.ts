import { program } from 'commander';
import { createServer } from 'vite';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import {
  DEFAULT_PORT,
  PLUGIN_DEVELOPMENT_DIRECTORY,
  PLUGIN_WORKSPACE_DIRECTORY,
} from '../../lib/constants.js';
import { importK2PluginConfig } from '../../lib/import.js';
import { generateCert, hasCertificates, loadCertificates } from '../../lib/cert.js';
import { createViteConfig, buildEntriesWithVite, getPluginEntryPoints } from '../../lib/vite.js';
import { getManifest } from './create-manifest.js';
import { watchCss } from './tailwind.js';
import { watchContentsAndUploadZip } from './upload.js';

export default function command() {
  program
    .command('dev')
    .option(
      '-p, --ppk <ppk>',
      '.ppk file path',
      path.join(PLUGIN_WORKSPACE_DIRECTORY, 'private.ppk')
    )
    .option('-c, --cert-dir <certDir>', 'Certificate directory', PLUGIN_WORKSPACE_DIRECTORY)
    .description('Start development server with Vite.')
    .action(action);
}

export async function action(options: { ppk: string; certDir: string }) {
  console.group('🍳 Start development server');
  try {
    const { ppk: ppkPath, certDir } = options;
    const config = await importK2PluginConfig();

    const certDirPath = path.resolve(certDir);
    const outputDir = path.resolve(PLUGIN_DEVELOPMENT_DIRECTORY);

    if (!fs.existsSync(PLUGIN_DEVELOPMENT_DIRECTORY)) {
      await fs.mkdir(PLUGIN_DEVELOPMENT_DIRECTORY, { recursive: true });
    }

    const port = config.server?.port ?? DEFAULT_PORT;

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

    const manifest = await getManifest({ config, port });
    console.log(`📝 manifest.json generated`);

    const entries = getPluginEntryPoints({
      configEntry: path.resolve('src', 'config'),
      desktopEntry: path.resolve('src', 'desktop'),
    });

    const entryNames = Object.keys(entries);
    if (entryNames.length === 0) {
      throw new Error('No entry points found for plugin. Check src/config and src/desktop paths.');
    }

    console.log(chalk.gray(`  Entry points: ${entryNames.join(', ')}`));

    // await fs.emptyDir(outputDir);

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

    console.log(chalk.green(`\n✨ Plugin development server ready!`));
    console.log(chalk.cyan(`   Local: https://localhost:${port}`));
    console.log(chalk.gray(`   Output: ${outputDir}`));
    console.log(chalk.gray(`   Files: config.js, desktop.js`));
    console.log(chalk.gray('\n   Watching for changes...\n'));

    // ファイル監視してビルド
    const chokidar = await import('chokidar');
    // chokidar v4ではディレクトリを直接監視
    const watchDirs = [
      path.resolve('src', 'config'),
      path.resolve('src', 'desktop'),
      path.resolve('src', 'lib'),
    ].filter((dir) => fs.existsSync(dir));

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

    // 並列タスク
    Promise.all([watchContentsAndUploadZip({ manifest, ppkPath }), watchCss(config)]);
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
