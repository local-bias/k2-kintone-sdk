import { zipSync } from 'fflate';
import fs from 'fs-extra';
import path from 'node:path';
import { PLUGIN_CONTENTS_DIRECTORY } from './constants.js';
import { generatePPK, generatePluginId, getPublicKeyDer, sign } from './rsa.js';

/** manifest.json 内でカスタマイズファイルを保持しているプロパティ */
const RESOURCE_KEYS = ['desktop', 'mobile', 'config'] as const satisfies readonly (keyof Plugin.Meta.Manifest)[];

/** 外部URLはZIPに含めないため除外します */
const isExternalUrl = (file: string): boolean => /^https?:\/\//.test(file);

/**
 * manifest.json からプラグインに必要なソースファイル一覧を抽出します
 */
export function sourceList(manifest: Plugin.Meta.Manifest): string[] {
  const files = RESOURCE_KEYS.flatMap((key) => {
    const resources = manifest[key];
    return [...(resources?.js ?? []), ...(resources?.css ?? [])];
  }).filter((file) => !isExternalUrl(file));

  if (manifest.config?.html) {
    files.push(manifest.config.html);
  }
  files.push(manifest.icon);

  return [...new Set(files)];
}

/**
 * ファイルのレコードからZIPバッファを生成します
 *
 * 値が Buffer の場合はその内容を、文字列の場合はそのパスのファイル内容を格納します
 */
export function zipFiles(files: Record<string, Buffer | string>): Buffer {
  const zipObj: Record<string, Uint8Array> = {};

  for (const [fileName, fileContent] of Object.entries(files)) {
    zipObj[fileName] = new Uint8Array(
      Buffer.isBuffer(fileContent) ? fileContent : fs.readFileSync(fileContent)
    );
  }

  return Buffer.from(zipSync(zipObj));
}

/**
 * コンテンツディレクトリからcontents.zipを生成します
 */
export function createContentsZip(
  contentsDir: string,
  manifest: Plugin.Meta.Manifest,
  fileContents: Record<string, Buffer | string> = {}
): Buffer {
  const files: Record<string, Buffer | string> = {};
  for (const file of sourceList(manifest)) {
    files[file] = fileContents[file] ?? path.join(contentsDir, file);
  }

  files['manifest.json'] = Buffer.from(JSON.stringify(manifest, null, 2));

  logTargetFiles(Object.keys(files));

  return zipFiles(files);
}

function logTargetFiles(fileNames: string[]): void {
  console.group('📁 Target files');
  fileNames.forEach((file, i) => {
    const prefix = i === fileNames.length - 1 ? '└─' : '├─';
    console.log(`${prefix} 📄 ${file}`);
  });
  console.groupEnd();
}

/**
 * コンテンツディレクトリから直接 contents.zip を作成します
 * (ファイルシステムから読み取り)
 */
export function createContentsZipFromDir(manifest: Plugin.Meta.Manifest): Buffer {
  return createContentsZip(PLUGIN_CONTENTS_DIRECTORY, manifest);
}

/**
 * 秘密鍵を使用してプラグインZIPを生成します (contents.zip + PUBKEY + SIGNATURE)
 *
 * 秘密鍵が存在しない場合は新規に生成します
 */
export function createPluginZip(params: { ppkPath: string; contentsZip: Buffer }): {
  zip: Buffer;
  id: string;
  privateKey: string;
} {
  const { ppkPath, contentsZip } = params;

  const ppkContent = fs.existsSync(ppkPath)
    ? fs.readFileSync(ppkPath, 'utf-8')
    : generatePPK(ppkPath);

  const publicKeyDer = getPublicKeyDer(ppkContent);

  const zip = zipFiles({
    'contents.zip': contentsZip,
    PUBKEY: publicKeyDer,
    SIGNATURE: sign(contentsZip, ppkContent),
  });

  return { zip, id: generatePluginId(publicKeyDer), privateKey: ppkContent };
}

export const getZipFileNameSuffix = (env: Plugin.Meta.Env): string =>
  env === 'prod' ? '' : `-${env}`;

/** 環境に応じたプラグインZIPのファイル名を返します */
export const getPluginZipFileName = (env: Plugin.Meta.Env): string =>
  `plugin${getZipFileNameSuffix(env)}.zip`;
