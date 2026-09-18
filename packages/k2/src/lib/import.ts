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

export const importK2Config = (configFileName?: string): Promise<K2.Config> =>
  importDefault<K2.Config>(configFileName ?? CONFIG_FILE_NAME);

export const importK2PluginConfig = (configFileName?: string): Promise<Plugin.Meta.Config> =>
  importDefault<Plugin.Meta.Config>(configFileName ?? PLUGIN_CONFIG_FILE_NAME);
