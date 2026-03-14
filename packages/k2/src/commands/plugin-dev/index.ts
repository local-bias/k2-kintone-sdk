import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import {
  DEFAULT_PORT,
  PLUGIN_DEVELOPMENT_DIRECTORY,
  PLUGIN_WORKSPACE_DIRECTORY,
} from '../../lib/constants.js';
import { importK2PluginConfig } from '../../lib/import.js';
import { generateCert, hasCertificates, loadCertificates } from '../../lib/cert/index.js';
import { startRsbuildDevServer, getPluginEntryPoints } from '../../lib/rsbuild.js';
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
    .description('Start development server with rsbuild.')
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

    const { key, cert } = loadCertificates(certDirPath);

    // rsbuild 開発サーバー起動 (ビルド + ファイル監視 + 配信)
    const { port: actualPort } = await startRsbuildDevServer({
      entries,
      outDir: outputDir,
      port,
      https: { key, cert },
      publicDir: outputDir,
      onFirstCompile: () => {
        console.log(chalk.green(`\n✨ Plugin development server ready!`));
        console.log(chalk.cyan(`   Local: https://localhost:${actualPort}`));
        console.log(chalk.gray(`   Output: ${outputDir}`));
        console.log(chalk.gray(`   Files: config.js, desktop.js`));
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

    // 並列タスク: コンテンツ監視+アップロード, TailwindCSS監視
    Promise.all([watchContentsAndUploadZip({ manifest, ppkPath }), watchCss(config)]);
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
