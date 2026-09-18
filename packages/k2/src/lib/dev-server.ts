import chalk from 'chalk';
import { ensureCertificates } from './cert/index.js';
import { logEvent } from './log-format.js';
import { startRsbuildDevServer } from './rsbuild.js';

/**
 * SSL証明書を用意した上で rsbuild 開発サーバーを起動します
 *
 * `k2 dev` と `plugin dev` で共通の起動処理です
 */
export async function startDevServer(params: {
  entries: Record<string, string>;
  outDir: string;
  certDir: string;
  port: number;
  title: string;
  /** 起動完了時に追加で表示する行 */
  extraLines?: string[];
}): Promise<{ port: number; close: () => Promise<void> }> {
  const { entries, outDir, certDir, port, title, extraLines = [] } = params;

  const { key, cert } = ensureCertificates(certDir);

  // 初回コンパイルはサーバー起動の解決前後どちらでも完了しうるため、Promiseで同期します
  let notifyFirstCompile: () => void;
  const firstCompiled = new Promise<void>((resolve) => {
    notifyFirstCompile = resolve;
  });

  const server = await startRsbuildDevServer({
    entries,
    outDir,
    port,
    https: { key, cert },
    publicDir: outDir,
    onFirstCompile: () => notifyFirstCompile(),
    onRecompile: () => logEvent('rsbuild', 'rebuild complete'),
  });

  void firstCompiled.then(() => {
    console.log(chalk.green(`\n✨ ${title}`));
    console.log(chalk.cyan(`   Local: https://localhost:${server.port}`));
    console.log(chalk.gray(`   Output: ${outDir}`));
    for (const line of extraLines) {
      console.log(chalk.gray(`   ${line}`));
    }
    console.log(chalk.gray('\n   Watching for changes...\n'));
  });

  return server;
}
