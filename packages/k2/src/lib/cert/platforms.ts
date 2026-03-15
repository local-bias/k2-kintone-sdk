import { spawnSync } from 'node:child_process';
import { PKG_NAME } from './constants.js';
import logger from '../logger.js';

// --- macOS ---
function addToTrustStoresDarwin(certPath: string): void {
  logger.log('Adding certificate to trusted store. Admin rights may be required.');
  spawnSync(
    'sudo',
    [
      'security',
      'add-trusted-cert',
      '-d',
      '-r',
      'trustRoot',
      '-k',
      '/Library/Keychains/System.keychain',
      '-p',
      'ssl',
      '-p',
      'basic',
      certPath,
    ],
    { stdio: 'inherit' }
  );
}

function removeFromTrustStoresDarwin(certPath: string): void {
  logger.log('Removing certificate from trusted store. Admin rights may be required.');
  spawnSync('sudo', ['security', 'remove-trusted-cert', '-d', certPath], {
    stdio: 'ignore',
  });
}

// --- Linux ---
const targetCA = `/usr/local/share/ca-certificates/${PKG_NAME}.crt`;

function addToTrustStoresLinux(certPath: string): void {
  logger.log('Adding certificate to trusted store. Admin rights may be required.');
  spawnSync('sudo', ['cp', certPath, targetCA]);
  spawnSync('sudo', ['update-ca-certificates']);
}

function removeFromTrustStoresLinux(): void {
  logger.log('Removing certificate from trusted store. Admin rights may be required.');
  spawnSync('sudo', ['rm', targetCA], { stdio: 'inherit' });
  spawnSync('sudo', ['update-ca-certificates']);
}

// --- Windows ---
function addToTrustStoresWin32(certPath: string): void {
  spawnSync('certutil', ['-addstore', '-user', 'root', certPath], {
    stdio: 'inherit',
  });
}

function removeFromTrustStoresWin32(): void {
  spawnSync('certutil', ['-delstore', '-user', 'root', PKG_NAME], {
    stdio: 'inherit',
  });
}

// --- Platform dispatcher ---
export function addToTrustStores(certPath: string): void {
  switch (process.platform) {
    case 'darwin':
      return addToTrustStoresDarwin(certPath);
    case 'linux':
      return addToTrustStoresLinux(certPath);
    case 'win32':
      return addToTrustStoresWin32(certPath);
  }
}

export function removeFromTrustStores(certPath?: string): void {
  switch (process.platform) {
    case 'darwin':
      if (certPath) removeFromTrustStoresDarwin(certPath);
      return;
    case 'linux':
      return removeFromTrustStoresLinux();
    case 'win32':
      return removeFromTrustStoresWin32();
  }
}
