import { WORKSPACE_DIRECTORY } from './constants.js';
import { importPluginConfig } from './import.js';
import fs from 'fs-extra';
import path from 'path';

function merge(
  src: Record<string, any>,
  dst: Record<string, any>
): Record<string, any> {
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
  env: string,
  options?: {
    config?: Plugin.Env;
  }
) => {
  const config = options?.config || (await importPluginConfig());

  const merged = merge(config.manifest.base, config.manifest[env] || {});

  const contentsPath = path.join(WORKSPACE_DIRECTORY, 'contents');

  await fs.mkdirs(contentsPath);
  await fs.writeJson(path.join(contentsPath, 'manifest.json'), merged);
};
