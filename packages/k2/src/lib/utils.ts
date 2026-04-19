import fs from 'fs-extra';
import path from 'path';
import { PLUGIN_WORKSPACE_DIRECTORY } from './constants.js';
import { uploadPlugin } from './kintone-api-client.js';
import { createContentsZipFromDir, createPluginZip, getZipFileNameSuffix } from './zip.js';

export const isEnv = (env: string): env is Plugin.Meta.Env => {
  return ['prod', 'dev', 'standalone'].includes(env);
};

/**
 * プラグインをビルドしてkintoneにアップロードします
 */
export const buildAndUploadPlugin = async (params: {
  env: Plugin.Meta.Env;
  manifest: Plugin.Meta.Manifest;
  ppkPath: string;
}): Promise<{ method: 'PUT' | 'POST'; pluginId: string }> => {
  const { env, manifest, ppkPath } = params;

  const contentsZip = createContentsZipFromDir(manifest);
  const { zip, id: pluginId } = createPluginZip({ ppkPath, contentsZip });

  const zipFileName = `plugin${getZipFileNameSuffix(env)}.zip`;

  await fs.writeFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, zipFileName), zip);

  const { method } = await uploadPlugin({
    pluginId,
    file: { name: zipFileName, data: zip },
  });

  return { method, pluginId };
};
