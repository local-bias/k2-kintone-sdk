import { pathToFileURL } from 'url';

export const esmImport = (path: string) => {
  if (process.platform === 'win32') {
    return import(pathToFileURL(path).toString());
  } else {
    return import(path);
  }
};

export const importPluginConfig = async () => {
  return (await esmImport('plugin.config.mjs')).default;
};
