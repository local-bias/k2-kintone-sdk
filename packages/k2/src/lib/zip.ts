import fs from 'fs-extra';
import path from 'path';
import { zipSync } from 'fflate';
import { PLUGIN_CONTENTS_DIRECTORY } from './constants.js';
import { sign, getPublicKeyDer, generatePPK, generatePluginId } from './rsa.js';

/**
 * manifest.json からプラグインに必要なソースファイル一覧を抽出します
 */
export function sourceList(manifest: Plugin.Meta.Manifest): string[] {
  const sourceTypes: [string, string][] = [
    ['desktop', 'js'],
    ['desktop', 'css'],
    ['mobile', 'js'],
    ['mobile', 'css'],
    ['config', 'js'],
    ['config', 'css'],
  ];

  const list = sourceTypes
    .map(([type, ext]) => (manifest as any)[type]?.[ext])
    .filter(Boolean)
    .reduce<string[]>((a, b) => a.concat(b), [])
    .filter((file: string) => !/^https?:\/\//.test(file));

  if (manifest.config?.html) list.push(manifest.config.html);
  list.push(manifest.icon);
  return Array.from(new Set(list));
}

/**
 * ファイルのレコードからZIPバッファを生成します
 */
export function zipFiles(files: Record<string, Buffer | string>): Buffer {
  const zipObj: Record<string, Uint8Array> = {};

  for (const [fileName, fileContent] of Object.entries(files)) {
    let content: Uint8Array;
    if (Buffer.isBuffer(fileContent)) {
      content = new Uint8Array(fileContent);
    } else if (typeof fileContent === 'string') {
      const fileData = fs.readFileSync(fileContent);
      content = new Uint8Array(fileData);
    } else {
      throw new Error(`Unsupported file content type for file: ${fileName}`);
    }
    zipObj[fileName] = content;
  }

  const zipped = zipSync(zipObj);
  return Buffer.from(zipped);
}

/**
 * コンテンツディレクトリからcontents.zipを生成します
 */
export function createContentsZip(
  contentsDir: string,
  manifest: Plugin.Meta.Manifest,
  fileContents: Record<string, Buffer | string> = {}
): Buffer {
  const files = sourceList(manifest).reduce<Record<string, Buffer | string>>((acc, file) => {
    acc[file] = fileContents[file] || path.join(contentsDir, file);
    return acc;
  }, {});

  files['manifest.json'] = Buffer.from(JSON.stringify(manifest, null, 2));

  const targetFiles = Object.keys(files);
  console.group('📁 Target files');
  targetFiles.forEach((file, i) => {
    const prefix = i === targetFiles.length - 1 ? '└─' : '├─';
    console.log(`${prefix} 📄 ${file}`);
  });
  console.groupEnd();

  return zipFiles(files);
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
 */
export function createPluginZip(params: { ppkPath: string; contentsZip: Buffer }): {
  zip: Buffer;
  id: string;
  privateKey: string;
} {
  const { ppkPath, contentsZip } = params;

  let ppkContent: string;
  if (fs.existsSync(ppkPath)) {
    ppkContent = fs.readFileSync(ppkPath, 'utf-8');
  } else {
    ppkContent = generatePPK(ppkPath);
  }

  const signature = sign(contentsZip, ppkContent);
  const publicKeyDer = getPublicKeyDer(ppkContent);
  const pluginId = generatePluginId(publicKeyDer);

  const pluginZip = zipFiles({
    'contents.zip': contentsZip,
    PUBKEY: publicKeyDer,
    SIGNATURE: signature,
  });

  return { zip: pluginZip, id: pluginId, privateKey: ppkContent };
}

export const getZipFileNameSuffix = (env: string): string => {
  return env === 'prod' ? '' : `-${env}`;
};
