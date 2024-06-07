import { PLUGIN_WORKSPACE_DIRECTORY } from './constants.js';
import { exec } from './exec.js';
import { getZipFileNameSuffix } from './zip.js';
import { config } from 'dotenv';

export const isEnv = (env: string): env is Plugin.Meta.Env => {
  return ['prod', 'dev', 'standalone'].includes(env);
};

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
KINTONE_PASSWORD
    `);
  }

  const zipFileName = `plugin${getZipFileNameSuffix(env)}.zip`;

  let command = `kintone-plugin-uploader ${PLUGIN_WORKSPACE_DIRECTORY}/${zipFileName} --base-url ${KINTONE_BASE_URL} --username ${KINTONE_USERNAME} --password ${KINTONE_PASSWORD}`;
  if (KINTONE_BASIC_AUTH_USERNAME && KINTONE_BASIC_AUTH_PASSWORD) {
    command += ` --basic-auth-username ${KINTONE_BASIC_AUTH_USERNAME} --basic-auth-password ${KINTONE_BASIC_AUTH_PASSWORD}`;
  }

  return exec(command);
};
