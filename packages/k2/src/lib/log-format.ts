import chalk from 'chalk';

const TIMESTAMP_COLOR = '#e5e7eb';

/**
 * 開発サーバーのイベントログを `HH:MM:SS [scope] message` 形式で出力します
 */
export function logEvent(scope: string, message: string): void {
  console.log(
    chalk.hex(TIMESTAMP_COLOR)(`${new Date().toLocaleTimeString()} `) +
      chalk.cyan(`[${scope}] `) +
      message
  );
}

/**
 * 開発サーバーのイベント失敗ログを出力します
 */
export function logEventFailure(scope: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  logEvent(scope, `${chalk.red('failed')}${chalk.hex(TIMESTAMP_COLOR)(`: ${message}`)}`);
}
