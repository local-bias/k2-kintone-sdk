import os from 'node:os';
import path from 'node:path';

export const PKG_NAME = 'k2';

export const isSupported =
  process.platform === 'darwin' || process.platform === 'linux' || process.platform === 'win32';

/**
 * OSごとのアプリケーション設定ディレクトリを返します
 */
function getApplicationConfigPath(name: string): string {
  const home = os.homedir();

  switch (process.platform) {
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', name);
    case 'win32':
      return path.join(
        process.env.LOCALAPPDATA ?? path.join(home, 'AppData', 'Local'),
        name
      );
    default:
      return path.join(process.env.XDG_CONFIG_HOME ?? path.join(home, '.config'), name);
  }
}

export const pkgDir = getApplicationConfigPath(PKG_NAME);
export const rootCAPath = path.resolve(pkgDir, 'rootCA.pem');
export const rootCAKeyPath = path.resolve(pkgDir, 'rootCA-key.pem');
