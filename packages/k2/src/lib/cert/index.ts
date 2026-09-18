import fs from 'fs-extra';
import path from 'node:path';
import { createCA, createCert } from './cert.js';
import { isSupported, pkgDir, rootCAKeyPath, rootCAPath } from './constants.js';
import { addToTrustStores, removeFromTrustStores } from './platforms.js';

/** SSL証明書のファイル名 */
export const CERT_KEY_FILENAME = 'localhost-key.pem';
export const CERT_FILENAME = 'localhost-cert.pem';

/** 証明書の有効期間 (日) */
const DEFAULT_VALIDITY_DAYS = 7300;

/** 常に証明書へ含めるローカル開発用のホスト */
const LOCAL_DOMAINS = [
  'localhost',
  'localhost.localdomain',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
] as const;

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
  const { validity = DEFAULT_VALIDITY_DAYS } = options;

  if (!isSupported) {
    throw new Error(`Platform not supported: "${process.platform}"`);
  }

  // 証明書と秘密鍵は対で扱う必要があるため、片方でも欠けていれば作り直します
  if (fs.existsSync(rootCAPath) && fs.existsSync(rootCAKeyPath)) {
    return;
  }

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

/**
 * 指定されたドメインのSSL証明書を生成します
 */
export function certificateFor(requestedDomains: string | string[] = []): {
  key: string;
  cert: string;
} {
  const validity = DEFAULT_VALIDITY_DAYS;
  install({ validity });

  const requests = Array.isArray(requestedDomains) ? requestedDomains : [requestedDomains];
  const domains = [...new Set([...LOCAL_DOMAINS, ...requests])];

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

/**
 * SSL証明書が存在しない場合のみ生成します
 */
export function ensureCertificates(certDir: string): { key: Buffer; cert: Buffer } {
  if (!hasCertificates(certDir)) {
    generateCert(certDir);
  }
  return loadCertificates(certDir);
}
