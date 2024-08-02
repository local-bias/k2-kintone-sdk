import { PLUGIN_WORKSPACE_DIRECTORY } from './constants.js';
import { KintoneApiClient } from './kintone-api-client.js';
import { getZipFileNameSuffix } from './zip.js';
import fs from 'fs-extra';
import path from 'path';

export const isEnv = (env: string): env is Plugin.Meta.Env => {
  return ['prod', 'dev', 'standalone'].includes(env);
};

/**
 * プラグインを追加・更新するAPIを利用してプラグインをアップロードします
 */
export const apiUploadZip = async (params: {
  env: Plugin.Meta.Env;
  pluginId: string;
}): Promise<{ method: 'PUT' | 'POST' }> => {
  const { env, pluginId } = params;

  const kc = new KintoneApiClient();

  const zipFileName = `plugin${getZipFileNameSuffix(env)}.zip`;

  const zipFile = new Blob([await fs.readFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, zipFileName))]);

  const fileKey = await kc.upload({ blob: zipFile, fileName: zipFileName });

  const plugins = await kc.getAllPlugins();

  const plugin = plugins.find((p) => p.id === pluginId);
  if (plugin) {
    const json = await kc.updatePlugin({ id: pluginId, fileKey });
    if ('errors' in json && json.errors) {
      console.error((json.errors.id?.messages ?? []).map((m: string) => `Error: ${m}`).join('\n'));
    }
    return { method: 'PUT' };
  }
  const result = await kc.addPlugin({ fileKey });
  if ('code' in result) {
    console.error(`Error: ${result.message}`);
  }
  return { method: 'POST' };
};

/**
 * @kintone/plugin-uploaderを利用してプラグインをアップロードします
 * APIを使用した方が高速ですが、2024年11月までは設定により無効になる可能性があるため、暫定的に残しています
 * 使用するには@kintone/plugin-uploaderがインストールされている必要があります
 */
/*
export const uploadZip = async (env: Plugin.Meta.Env) => {
  config();

  const {
    KINTONE_BASE_URL,
    KINTONE_USERNAME,
    KINTONE_PASSWORD,
    KINTONE_BASIC_AUTH_USERNAME = '',
    KINTONE_BASIC_AUTH_PASSWORD = '',
  } = process.env;
  if (!KINTONE_BASE_URL || !KINTONE_USERNAME || !KINTONE_PASSWORD) {
    throw new Error(`.envの設定が不十分です。以下のパラメータは必須です
KINTONE_BASE_URL
KINTONE_USERNAME
KINTONE_PASSWORD`);
  }

  const zipFileName = `plugin${getZipFileNameSuffix(env)}.zip`;

  let command = `kintone-plugin-uploader ${PLUGIN_WORKSPACE_DIRECTORY}/${zipFileName} --base-url ${KINTONE_BASE_URL} --username ${KINTONE_USERNAME} --password ${KINTONE_PASSWORD}`;
  if (KINTONE_BASIC_AUTH_USERNAME && KINTONE_BASIC_AUTH_PASSWORD) {
    command += ` --basic-auth-username ${KINTONE_BASIC_AUTH_USERNAME} --basic-auth-password ${KINTONE_BASIC_AUTH_PASSWORD}`;
  }

  return exec(command);
};
*/
