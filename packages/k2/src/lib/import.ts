import fs from 'fs-extra';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CONFIG_FILE_NAME, PLUGIN_CONFIG_FILE_NAME } from './constants.js';

/**
 * 絶対パス・相対パスのどちらでも動作するように file URL 経由で ESM を読み込みます
 *
 * Windows ではドライブレターがプロトコルとして解釈されるため、file URL への変換が必須です
 */
export const esmImport = async (modulePath: string): Promise<Record<string, unknown>> => {
  return import(pathToFileURL(path.resolve(modulePath)).href);
};

const importDefault = async <T>(modulePath: string): Promise<T> => {
  const loaded = await esmImport(modulePath);
  return loaded.default as T;
};

/**
 * k2 の設定ファイルを読み込みます
 *
 * - パスを指定した場合、ファイルが存在しなければエラーになります
 * - パスを省略した場合、既定の設定ファイル (`k2.config.mjs`) が存在しなければ `null` を返します
 *
 * 構文エラーなど、設定ファイル自体の読み込み失敗は握りつぶさずに送出します
 */
export const loadK2Config = async (configFileName?: string): Promise<K2.Config | null> => {
  const filePath = path.resolve(configFileName ?? CONFIG_FILE_NAME);

  if (!(await fs.pathExists(filePath))) {
    if (configFileName) {
      throw new Error(`Config file not found: ${configFileName}`);
    }
    return null;
  }

  return importDefault<K2.Config>(filePath);
};

export const importK2PluginConfig = (configFileName?: string): Promise<Plugin.Meta.Config> =>
  importDefault<Plugin.Meta.Config>(configFileName ?? PLUGIN_CONFIG_FILE_NAME);
