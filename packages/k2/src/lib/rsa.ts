import forge from 'node-forge';
import fs from 'fs-extra';

/**
 * contents.zip を秘密鍵で署名します
 */
export function sign(contents: Buffer, privateKeyPem: string): Buffer {
  const key = forge.pki.privateKeyFromPem(privateKeyPem);
  const md = forge.md.sha1.create();
  md.update(contents.toString('binary'));
  const signature = key.sign(md);
  return Buffer.from(signature, 'binary');
}

/**
 * 秘密鍵から公開鍵のDER形式を取得します
 */
export function getPublicKeyDer(privateKeyPem: string): Buffer {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const publicKey = forge.pki.rsa.setPublicKey(privateKey.n, privateKey.e);
  const publicKeyAsn1 = forge.pki.publicKeyToAsn1(publicKey);
  const publicKeyDerBytes = forge.asn1.toDer(publicKeyAsn1).getBytes();
  return Buffer.from(publicKeyDerBytes, 'binary');
}

/**
 * RSA秘密鍵 (PPK) を生成し、ファイルに保存します
 */
export function generatePPK(ppkPath: string): string {
  const keypair = forge.pki.rsa.generateKeyPair(1024);
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
  const hexDigest = hash.subarray(0, 16).toString('hex');
  return hexDigest.replace(/[0-9a-f]/g, (c) => 'abcdefghijklmnop'['0123456789abcdef'.indexOf(c)]);
}
