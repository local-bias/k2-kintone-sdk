import fs from 'fs-extra';
import forge from 'node-forge';

/**
 * kintoneプラグインの仕様で要求される鍵長
 *
 * @see {@link https://cybozu.dev/ja/kintone/docs/overview/plugin-specification/ | プラグインの仕様}
 */
const PPK_KEY_SIZE = 1024;

/** プラグインIDは16進数の各文字を a-p に読み替えた文字列です */
const HEX_CHARS = '0123456789abcdef';
const PLUGIN_ID_CHARS = 'abcdefghijklmnop';

/**
 * contents.zip を秘密鍵で署名します
 */
export function sign(contents: Buffer, privateKeyPem: string): Buffer {
  const key = forge.pki.privateKeyFromPem(privateKeyPem);
  const md = forge.md.sha1.create();
  md.update(contents.toString('binary'));
  return Buffer.from(key.sign(md), 'binary');
}

/**
 * 秘密鍵から公開鍵のDER形式を取得します
 */
export function getPublicKeyDer(privateKeyPem: string): Buffer {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const publicKey = forge.pki.rsa.setPublicKey(privateKey.n, privateKey.e);
  const publicKeyAsn1 = forge.pki.publicKeyToAsn1(publicKey);
  return Buffer.from(forge.asn1.toDer(publicKeyAsn1).getBytes(), 'binary');
}

/**
 * RSA秘密鍵 (PPK) を生成し、ファイルに保存します
 */
export function generatePPK(ppkPath: string): string {
  const keypair = forge.pki.rsa.generateKeyPair(PPK_KEY_SIZE);
  const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
  fs.outputFileSync(ppkPath, privateKey);
  return privateKey;
}

/**
 * 公開鍵からプラグインIDを生成します
 */
export function generatePluginId(publicKeyDer: Buffer): string {
  const md = forge.md.sha256.create();
  md.update(publicKeyDer.toString('binary'));
  const hash = Buffer.from(md.digest().bytes(), 'binary');
  return hash
    .subarray(0, 16)
    .toString('hex')
    .replace(/[0-9a-f]/g, (c) => PLUGIN_ID_CHARS[HEX_CHARS.indexOf(c)] ?? c);
}
