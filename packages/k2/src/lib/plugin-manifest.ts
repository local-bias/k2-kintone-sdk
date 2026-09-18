import merge from 'deepmerge';
import fs from 'fs-extra';
import path from 'node:path';
import { PLUGIN_CONTENTS_DIRECTORY } from './constants.js';
import { importK2PluginConfig } from './import.js';

/**
 * `manifest.base` に環境ごとの設定をマージし、manifest.json を出力します
 */
export const outputManifest = async (
  env: Plugin.Meta.Env,
  options?: { config?: Plugin.Meta.Config }
): Promise<Plugin.Meta.Manifest> => {
  const config = options?.config ?? (await importK2PluginConfig());

  const merged = merge(config.manifest.base, config.manifest[env] ?? {}) as Plugin.Meta.Manifest;

  await fs.outputJson(path.join(PLUGIN_CONTENTS_DIRECTORY, 'manifest.json'), merged);

  return merged;
};
