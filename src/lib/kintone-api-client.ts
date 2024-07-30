import { config } from 'dotenv';

type GetPluginsParams = {
  offset?: number;
  limit?: number;
};
type Plugin = {
  id: string;
  name: string;
  isMarketplace: boolean;
  version: string;
};

type GetPluginsSuccessResponse = {
  plugins: Plugin[];
};
type GetPluginResponse = GetPluginsSuccessResponse;

type AddPluginSuccessResponse = {
  id: string;
  revision: string;
};
type AddPluginErrorResponse = {
  code: string;
  id: string;
  message: string;
};
type AddPluginResponse = AddPluginSuccessResponse | AddPluginErrorResponse;

type UpdatePluginSuccessResponse = {
  id: string;
  revision: string;
};
type UpdatePluginErrorResponse = {
  code: string;
  id: string;
  message: string;
  errors?: Record<string, { messages: string[] }>;
};
type UpdatePluginResponse = UpdatePluginSuccessResponse | UpdatePluginErrorResponse;

export class KintoneApiClient {
  #baseUrl: string;
  #authHeader: Record<string, string>;

  public constructor() {
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
    this.#baseUrl = KINTONE_BASE_URL;
    this.#authHeader = authHeader;
  }

  private getEndpointUrl(path: string): string {
    return `${this.#baseUrl}${path}`;
  }

  public async upload(params: { blob: Blob; fileName: string }): Promise<string> {
    const { blob, fileName } = params;

    const form = new FormData();
    form.append('file', blob, fileName);

    const uploadResult = await fetch(this.getEndpointUrl('/k/v1/file.json'), {
      method: 'POST',
      headers: this.#authHeader,
      body: form,
    });

    const { fileKey }: { fileKey: string } = await uploadResult.json();

    return fileKey;
  }

  public async getPlugins(params: GetPluginsParams = {}): Promise<GetPluginResponse> {
    const url = new URL(this.getEndpointUrl('/k/v1/plugins.json'));
    if (params.offset) {
      url.searchParams.set('offset', String(params.offset));
    }
    if (params.limit) {
      url.searchParams.set('limit', String(params.limit));
    }

    const pluginResponse = await fetch(url.toString(), {
      headers: this.#authHeader,
    });

    return pluginResponse.json();
  }

  public async getAllPlugins(): Promise<Plugin[]> {
    const plugins: Plugin[] = [];
    let offset = 0;
    let limit = 100;
    let hasMore = true;

    while (hasMore) {
      const { plugins: currentPlugins } = await this.getPlugins({ offset, limit });
      plugins.push(...currentPlugins);

      if (currentPlugins.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    return plugins;
  }

  public async addPlugin(params: { fileKey: string }): Promise<AddPluginResponse> {
    const { fileKey } = params;

    const pluginResponse = await fetch(this.getEndpointUrl('/k/v1/plugin.json'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.#authHeader,
      },
      body: JSON.stringify({
        fileKey,
      }),
    });

    return pluginResponse.json();
  }

  public async updatePlugin(params: {
    id: string;
    fileKey: string;
  }): Promise<UpdatePluginResponse> {
    const pluginResponse = await fetch(this.getEndpointUrl('/k/v1/plugin.json'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.#authHeader,
      },
      body: JSON.stringify(params),
    });

    return pluginResponse.json();
  }
}
