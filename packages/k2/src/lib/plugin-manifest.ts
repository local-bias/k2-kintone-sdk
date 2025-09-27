import { PLUGIN_CONTENTS_DIRECTORY } from './constants.js';
import { importK2PluginConfig } from './import.js';
import fs from 'fs-extra';
import path from 'path';
import { mergeDeep } from 'remeda';

export const outputManifest = async (
  env: 'dev' | 'prod' | 'standalone',
  options?: { config?: Plugin.Meta.Config }
): Promise<Plugin.Meta.Manifest> => {
  const config = options?.config || (await importK2PluginConfig());

  const merged = mergeDeep(config.manifest.base, config.manifest[env] || {}) as Plugin.Meta.Manifest;

  await fs.mkdirs(PLUGIN_CONTENTS_DIRECTORY);
  await fs.writeJson(path.join(PLUGIN_CONTENTS_DIRECTORY, 'manifest.json'), merged);

  return merged;
};
