import { PLUGIN_WORKSPACE_DIRECTORY } from './constants.js';
import { exec } from './exec.js';
import { getZipFileNameSuffix } from './zip.js';
import { config } from 'dotenv';
import fs from 'fs-extra';
import path from 'path';

export const isEnv = (env: string): env is Plugin.Meta.Env => {
  return ['prod', 'dev', 'standalone'].includes(env);
};

/**
 * プラグインを追加・更新するAPIを利用してプラグインをアップロードします
 */
export const apiUploadZip = async (env: Plugin.Meta.Env): Promise<{ method: 'PUT' | 'POST' }> => {
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

  const authHeader = {
    'X-Cybozu-Authorization': Buffer.from(`${KINTONE_USERNAME}:${KINTONE_PASSWORD}`).toString(
      'base64'
    ),
    ...(KINTONE_BASIC_AUTH_USERNAME &&
      KINTONE_BASIC_AUTH_PASSWORD && {
        Authorization: `Basic ${Buffer.from(
          `${KINTONE_BASIC_AUTH_USERNAME}:${KINTONE_BASIC_AUTH_PASSWORD}`
        ).toString('base64')}`,
      }),
  };

  const zipFileName = `plugin${getZipFileNameSuffix(env)}.zip`;

  const zipFile = new Blob([await fs.readFile(path.join(PLUGIN_WORKSPACE_DIRECTORY, zipFileName))]);

  const form = new FormData();
  form.append('file', zipFile, zipFileName);

  const uploadResult = await fetch(`${KINTONE_BASE_URL}/k/v1/file.json`, {
    method: 'POST',
    headers: authHeader,
    body: form,
  });

  const { fileKey }: { fileKey: string } = await uploadResult.json();

  const pluginEndpoint = `${KINTONE_BASE_URL}/k/v1/plugin.json`;
  const pluginResponse = await fetch(pluginEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
    body: JSON.stringify({
      fileKey,
    }),
  });

  const pluginResult = await pluginResponse.json();

  // プラグインがすでに存在する場合
  if (pluginResult?.code === 'GAIA_PL18') {
    await fetch(pluginEndpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
      body: JSON.stringify({ fileKey }),
    });
    return { method: 'PUT' };
  }
  return { method: 'POST' };
};

/**
 * @kintone/plugin-uploaderを利用してプラグインをアップロードします
 * APIを使用した方が高速ですが、2024年11月までは設定により無効になる可能性があるため、暫定的に残しています
 */
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
