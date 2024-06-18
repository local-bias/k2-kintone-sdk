import { pathToFileURL } from 'url';
import { CONFIG_FILE_NAME, PLUGIN_CONFIG_FILE_NAME } from './constants.js';

export const esmImport = (path: string) => {
  if (process.platform === 'win32') {
    return import(pathToFileURL(path).toString());
  } else {
    return import(path);
  }
};

export const importK2Config = async (configFileName?: string): Promise<K2.Config> => {
  return (await esmImport(configFileName ?? CONFIG_FILE_NAME)).default;
};

export const importPluginConfig = async (configFileName?: string): Promise<Plugin.Meta.Config> => {
  return (await esmImport(configFileName ?? PLUGIN_CONFIG_FILE_NAME)).default;
};
