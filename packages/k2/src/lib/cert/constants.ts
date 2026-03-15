import path from 'path';

const PKG_NAME = 'k2';

export const isSupported =
  process.platform === 'darwin' || process.platform === 'linux' || process.platform === 'win32';

function getApplicationConfigPath(name: string): string {
  if (process.platform === 'darwin') {
    return path.join(process.env.HOME!, 'Library', 'Application Support', name);
  }
  if (process.platform === 'win32') {
    return process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, name)
      : path.join(process.env.USERPROFILE!, 'Local Settings', 'Application Data', name);
  }
  // linux
  return process.env.XDG_CONFIG_HOME
    ? path.join(process.env.XDG_CONFIG_HOME, name)
    : path.join(process.env.HOME!, '.config', name);
}

export const pkgDir = getApplicationConfigPath(PKG_NAME);
export const rootCAPath = path.resolve(pkgDir, 'rootCA.pem');
export const rootCAKeyPath = path.resolve(pkgDir, 'rootCA-key.pem');
export { PKG_NAME };
