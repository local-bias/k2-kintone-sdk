import { config } from 'dotenv';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';

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

  if (!KINTONE_BASE_URL || !KINTONE_USERNAME || !KINTONE_PASSWORD) {
    throw new Error(`.envの設定が不十分です。以下のパラメータは必須です
KINTONE_BASE_URL
KINTONE_USERNAME
KINTONE_PASSWORD`);
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
 */
export async function uploadPlugin(params: {
  pluginId: string;
  file: { name: string; data: Buffer };
}): Promise<{ method: 'PUT' | 'POST' }> {
  const client = createKintoneClient();

  const { fileKey } = await client.file.uploadFile({ file: params.file });

  const { plugins } = await client.plugin.getPlugins({ offset: 0, limit: 100 });
  const isUpdate = plugins.some(({ id }) => id === params.pluginId);

  if (isUpdate) {
    await client.plugin.updatePlugin({ id: params.pluginId, fileKey });
    return { method: 'PUT' };
  }

  await client.plugin.installPlugin({ fileKey });
  return { method: 'POST' };
}
