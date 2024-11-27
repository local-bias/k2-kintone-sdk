import { restorePluginConfig as restore } from '@konomi-app/kintone-utilities';
import { nanoid } from 'nanoid';
import { isProd, PLUGIN_ID } from './global';
import { z } from 'zod';

export const PluginConditionV1Schema = z.object({
  id: z.string(),
  memo: z.string(),
  fields: z.array(z.string()),
  isSampleUIShown: z.boolean(),
});
export const PluginConfigV1Schema = z.object({
  version: z.literal(1),
  common: z.object({
    memo: z.string(),
    fields: z.array(z.string()),
  }),
  conditions: z.array(PluginConditionV1Schema),
});

export const validatePluginCondition = (condition: unknown): Plugin.Condition => {
  return PluginConditionV1Schema.parse(condition);
};

export const getNewCondition = (): Plugin.Condition => ({
  id: nanoid(),
  memo: '',
  fields: [''],
  isSampleUIShown: true,
});

/**
 * プラグインの設定情報のひな形を返却します
 */
export const createConfig = (): Plugin.Config => ({
  version: 1,
  common: {
    memo: '',
    fields: [],
  },
  conditions: [getNewCondition()],
});

/**
 * 古いバージョンの設定情報を新しいバージョンに変換します
 * 各バージョンは次のバージョンへの変換処理を持ち、再帰的なアクセスによって最新のバージョンに変換されます
 *
 * @param anyConfig 保存されている設定情報
 * @returns 新しいバージョンの設定情報
 */
export const migrateConfig = (anyConfig: Plugin.AnyConfig): Plugin.Config => {
  const { version } = anyConfig;
  switch (version) {
    case undefined:
      return migrateConfig({ ...anyConfig, version: 1 });
    case 1:
    default: // `default` -> `config.js`と`desktop.js`のバージョンが一致していない場合に通る可能性があるため必要
      // もし新しいバージョンを追加したらここに追加する
      // return migrateConfig({ version: 2, ...anyConfig });
      return anyConfig;
  }
};

/**
 * プラグインの設定情報を復元します
 */
export const restorePluginConfig = (): Plugin.Config => {
  const config = restore<Plugin.AnyConfig>(PLUGIN_ID, { debug: !isProd }) ?? createConfig();
  return migrateConfig(config);
};

export const getConditionField = <T extends keyof Plugin.Condition>(
  storage: Plugin.Config,
  props: {
    conditionIndex: number;
    key: T;
    defaultValue: NonNullable<Plugin.Condition[T]>;
  }
): NonNullable<Plugin.Condition[T]> => {
  const { conditionIndex, key, defaultValue } = props;
  if (!storage.conditions[conditionIndex]) {
    return defaultValue;
  }
  return storage.conditions[conditionIndex][key] ?? defaultValue;
};
