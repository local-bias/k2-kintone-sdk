import fs from 'fs-extra';
import path from 'node:path';
import { PLUGIN_WORKSPACE_DIRECTORY } from './constants.js';
import { uploadPlugin } from './kintone-api-client.js';
import { createContentsZipFromDir, createPluginZip, getPluginZipFileName } from './zip.js';

const ENVS: readonly Plugin.Meta.Env[] = ['prod', 'dev', 'standalone'];

export const isEnv = (env: string): env is Plugin.Meta.Env =>
  (ENVS as readonly string[]).includes(env);

/**
 * プラグインZIPを生成してワークスペースに書き出します
 */
export const writePluginZip = async (params: {
  env: Plugin.Meta.Env;
  manifest: Plugin.Meta.Manifest;
  ppkPath: string;
}): Promise<{ zip: Buffer; pluginId: string; zipFileName: string }> => {
  const { env, manifest, ppkPath } = params;

  const contentsZip = createContentsZipFromDir(manifest);
  const { zip, id: pluginId } = createPluginZip({ ppkPath: path.resolve(ppkPath), contentsZip });

  const zipFileName = getPluginZipFileName(env);
  await fs.outputFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, zipFileName), zip);

  return { zip, pluginId, zipFileName };
};

/**
 * プラグインをビルドしてkintoneにアップロードします
 */
export const buildAndUploadPlugin = async (params: {
  env: Plugin.Meta.Env;
  manifest: Plugin.Meta.Manifest;
  ppkPath: string;
}): Promise<{ method: 'PUT' | 'POST'; pluginId: string }> => {
  const { zip, pluginId, zipFileName } = await writePluginZip(params);

  const { method } = await uploadPlugin({
    pluginId,
    file: { name: zipFileName, data: zip },
  });

  return { method, pluginId };
};
