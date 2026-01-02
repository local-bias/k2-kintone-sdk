import { exec } from './exec.js';
import fs from 'fs-extra';
import path from 'path';

/** SSL証明書のファイル名 */
export const CERT_KEY_FILENAME = 'localhost-key.pem';
export const CERT_FILENAME = 'localhost-cert.pem';

/**
 * mkcertを使用してSSL証明書を生成する
 * @param outDir 証明書の出力先ディレクトリ
 */
export const generateCert = async (outDir: string): Promise<{ stdout: string }> => {
  await fs.ensureDir(outDir);
  const { stdout } = await exec(`mkcert localhost 127.0.0.1 ::1`);
  [
    { input: 'localhost+2.pem', output: CERT_FILENAME },
    { input: 'localhost+2-key.pem', output: CERT_KEY_FILENAME },
  ].forEach(({ input, output }) => {
    if (fs.existsSync(input)) {
      fs.moveSync(`./${input}`, path.join(outDir, output), {
        overwrite: true,
      });
    }
  });
  return { stdout };
};

/**
 * SSL証明書が存在するか確認する
 * @param certDir 証明書のディレクトリ
 */
export function hasCertificates(certDir: string): boolean {
  return (
    fs.existsSync(path.join(certDir, CERT_KEY_FILENAME)) &&
    fs.existsSync(path.join(certDir, CERT_FILENAME))
  );
}

/**
 * SSL証明書を読み込む
 * @param certDir 証明書のディレクトリ
 */
export function loadCertificates(certDir: string): { key: Buffer; cert: Buffer } {
  return {
    key: fs.readFileSync(path.join(certDir, CERT_KEY_FILENAME)),
    cert: fs.readFileSync(path.join(certDir, CERT_FILENAME)),
  };
}
