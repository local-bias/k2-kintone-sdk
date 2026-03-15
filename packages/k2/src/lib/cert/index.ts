import fs from 'fs-extra';
import path from 'path';
import { createCA, createCert } from './cert.js';
import { isSupported, pkgDir, rootCAPath, rootCAKeyPath } from './constants.js';
import { addToTrustStores, removeFromTrustStores } from './platforms.js';

/** SSL証明書のファイル名 */
export const CERT_KEY_FILENAME = 'localhost-key.pem';
export const CERT_FILENAME = 'localhost-cert.pem';

/**
 * CA証明書を信頼ストアから削除します
 */
export function uninstall(): void {
  removeFromTrustStores(rootCAPath);
  fs.removeSync(pkgDir);
}

/**
 * ルートCA証明書をインストールし、システムの信頼ストアに追加します
 */
export function install(options: { validity?: number } = {}): void {
  const { validity = 7300 } = options;

  if (!isSupported) {
    throw new Error(`Platform not supported: "${process.platform}"`);
  }

  if (!fs.existsSync(rootCAPath) && !fs.existsSync(rootCAKeyPath)) {
    const ca = createCA({ validity });
    fs.outputFileSync(rootCAPath, ca.cert);
    fs.outputFileSync(rootCAKeyPath, ca.key);
    try {
      addToTrustStores(rootCAPath);
    } catch {
      console.warn(
        '⚠ Failed to add CA to system trust store. You may need to trust the certificate manually.'
      );
    }
  }
}

/**
 * 指定されたドメインのSSL証明書を生成します
 */
export function certificateFor(requestedDomains: string | string[] = []): {
  key: string;
  cert: string;
} {
  const validity = 7300;
  install({ validity });

  const requests = Array.isArray(requestedDomains) ? requestedDomains : [requestedDomains];
  const domains = [
    ...new Set(['localhost', 'localhost.localdomain', '127.0.0.1', '0.0.0.0', '::1', ...requests]),
  ];

  const ca = {
    cert: fs.readFileSync(rootCAPath),
    key: fs.readFileSync(rootCAKeyPath),
  };

  return createCert({ ca, domains, validity });
}

/**
 * SSL証明書を生成し、指定ディレクトリに保存します
 */
export function generateCert(outDir: string): { key: string; cert: string } {
  fs.ensureDirSync(outDir);
  const result = certificateFor();
  fs.outputFileSync(path.join(outDir, CERT_FILENAME), result.cert);
  fs.outputFileSync(path.join(outDir, CERT_KEY_FILENAME), result.key);
  return result;
}

/**
 * SSL証明書が存在するか確認します
 */
export function hasCertificates(certDir: string): boolean {
  return (
    fs.existsSync(path.join(certDir, CERT_KEY_FILENAME)) &&
    fs.existsSync(path.join(certDir, CERT_FILENAME))
  );
}

/**
 * SSL証明書を読み込みます
 */
export function loadCertificates(certDir: string): { key: Buffer; cert: Buffer } {
  return {
    key: fs.readFileSync(path.join(certDir, CERT_KEY_FILENAME)),
    cert: fs.readFileSync(path.join(certDir, CERT_FILENAME)),
  };
}
