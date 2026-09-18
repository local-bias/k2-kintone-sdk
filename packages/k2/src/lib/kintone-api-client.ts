import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import { config } from 'dotenv';

/** インストール済みプラグインの取得件数の上限 (kintone REST APIの最大値) */
const PLUGIN_FETCH_LIMIT = 100;

/**
 * 環境変数からkintone REST APIクライアントを生成します
 */
export function createKintoneClient(): KintoneRestAPIClient {
  config();

  const {
    KINTONE_BASE_URL,
    KINTONE_USERNAME,
    KINTONE_PASSWORD,
    KINTONE_BASIC_AUTH_USERNAME,
    KINTONE_BASIC_AUTH_PASSWORD,
  } = process.env;

  // 分割代入後の変数を直接検査することで、以降の型を絞り込みます
  if (!KINTONE_BASE_URL || !KINTONE_USERNAME || !KINTONE_PASSWORD) {
    const missing = [
      ['KINTONE_BASE_URL', KINTONE_BASE_URL],
      ['KINTONE_USERNAME', KINTONE_USERNAME],
      ['KINTONE_PASSWORD', KINTONE_PASSWORD],
    ]
      .filter(([, value]) => !value)
      .map(([key]) => key);

    throw new Error(
      `.envの設定が不十分です。以下のパラメータは必須です\nKINTONE_BASE_URL\nKINTONE_USERNAME\nKINTONE_PASSWORD\n\n未設定: ${missing.join(', ')}`
    );
  }

  return new KintoneRestAPIClient({
    baseUrl: KINTONE_BASE_URL,
    auth: {
      username: KINTONE_USERNAME,
      password: KINTONE_PASSWORD,
    },
    ...(KINTONE_BASIC_AUTH_USERNAME && KINTONE_BASIC_AUTH_PASSWORD
      ? {
          basicAuth: {
            username: KINTONE_BASIC_AUTH_USERNAME,
            password: KINTONE_BASIC_AUTH_PASSWORD,
          },
        }
      : {}),
  });
}

/**
 * プラグインZIPをkintoneにアップロードします
 *
 * 同一IDのプラグインが既にインストールされている場合は更新、そうでなければ新規インストールします
 */
export async function uploadPlugin(params: {
  pluginId: string;
  file: { name: string; data: Buffer };
}): Promise<{ method: 'PUT' | 'POST' }> {
  const client = createKintoneClient();

  const { fileKey } = await client.file.uploadFile({ file: params.file });

  const { plugins } = await client.plugin.getPlugins({ offset: 0, limit: PLUGIN_FETCH_LIMIT });
  const isUpdate = plugins.some(({ id }) => id === params.pluginId);

  if (isUpdate) {
    await client.plugin.updatePlugin({ id: params.pluginId, fileKey });
    return { method: 'PUT' };
  }

  await client.plugin.installPlugin({ fileKey });
  return { method: 'POST' };
}
