import { PLUGIN_CONTENTS_DIRECTORY } from './constants.js';
import { importK2PluginConfig } from './import.js';
import fs from 'fs-extra';
import path from 'path';

function merge(src: Record<string, any>, dst: Record<string, any>): Record<string, any> {
  return Object.entries(src).reduce((acc, [key, value]) => {
    if (!dst[key]) {
      return { ...acc, [key]: value };
    }

    if (typeof dst[key] === 'string') {
      return { ...acc, [key]: dst[key] };
    }

    if (Array.isArray(value) && Array.isArray(dst[key])) {
      return { ...acc, [key]: [...value, ...dst[key]] };
    }

    return { ...acc, [key]: merge(src[key], dst[key]) };
  }, {});
}

export const outputManifest = async (
  env: 'dev' | 'prod' | 'standalone',
  options?: { config?: Plugin.Meta.Config }
): Promise<Plugin.Meta.Manifest> => {
  const config = options?.config || (await importK2PluginConfig());

  const merged = merge(config.manifest.base, config.manifest[env] || {}) as Plugin.Meta.Manifest;

  await fs.mkdirs(PLUGIN_CONTENTS_DIRECTORY);
  await fs.writeJson(path.join(PLUGIN_CONTENTS_DIRECTORY, 'manifest.json'), merged);

  return merged;
};
