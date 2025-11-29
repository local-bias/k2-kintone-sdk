import { PLUGIN_NAME } from '@/lib/constants';
import { t } from '@/lib/i18n';
import { createConfig, migrateConfig, restorePluginConfig } from '@/lib/plugin';
import { PluginConfig } from '@/schema/plugin-config';
import { onFileLoad, storePluginConfig } from '@konomi-app/kintone-utilities';
import { handleLoadingEndAtom, handleLoadingStartAtom, usePluginAtoms } from '@repo/jotai';
import { saveAsJson } from '@repo/utils';
import { atom } from 'jotai';
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, ReactNode } from 'react';
import invariant from 'tiny-invariant';

export const pluginConfigAtom = atom<PluginConfig>(restorePluginConfig());

export const handlePluginConfigResetAtom = atom(null, (_, set) => {
  set(pluginConfigAtom, createConfig());
  enqueueSnackbar(t('common.config.toast.reset'), { variant: 'success' });
});

export const {
  pluginConditionsAtom,
  hasMultipleConditionsAtom,
  conditionsLengthAtom,
  selectedConditionIdAtom,
  selectedConditionAtom,
  getConditionPropertyAtom,
  commonConfigAtom,
  isConditionIdUnselectedAtom,
  getCommonPropertyAtom,
} = usePluginAtoms(pluginConfigAtom, {
  enableCommonCondition: true,
});

export const handlePluginConditionDeleteAtom = atom(null, (get, set) => {
  const selectedConditionId = get(selectedConditionIdAtom);
  set(pluginConditionsAtom, (prev) =>
    prev.filter((condition) => condition.id !== selectedConditionId)
  );
  set(selectedConditionIdAtom, null);
  enqueueSnackbar(t('common.config.toast.onConditionDelete'), { variant: 'success' });
});

export const updatePluginConfig = atom(null, (get, set, actionComponent: ReactNode) => {
  try {
    set(handleLoadingStartAtom);
    const pluginConfig = get(pluginConfigAtom);
    storePluginConfig(pluginConfig, {
      callback: () => true,
      flatProperties: ['conditions'],
      debug: true,
    });
    enqueueSnackbar(t('common.config.toast.save'), {
      variant: 'success',
      action: actionComponent,
    });
  } finally {
    set(handleLoadingEndAtom);
  }
});

/**
 * jsonファイルを読み込み、プラグインの設定情報をインポートします
 */
export const importPluginConfigAtom = atom(
  null,
  async (_, set, event: ChangeEvent<HTMLInputElement>) => {
    try {
      set(handleLoadingStartAtom);
      const { files } = event.target;
      invariant(files?.length, 'ファイルが見つかりませんでした');
      const [file] = Array.from(files);
      const fileEvent = await onFileLoad(file!);
      const text = (fileEvent.target?.result ?? '') as string;
      set(pluginConfigAtom, migrateConfig(JSON.parse(text)));
      enqueueSnackbar(t('common.config.toast.import'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('common.config.error.import'), { variant: 'error' });
      throw error;
    } finally {
      set(handleLoadingEndAtom);
    }
  }
);

/**
 * プラグインの設定情報をjsonファイルとしてエクスポートします
 */
export const exportPluginConfigAtom = atom(null, (get, set) => {
  try {
    set(handleLoadingStartAtom);
    const pluginConfig = get(pluginConfigAtom);
    saveAsJson(pluginConfig, `${PLUGIN_NAME}-config.json`);
    enqueueSnackbar(t('common.config.toast.export'), { variant: 'success' });
  } catch (error) {
    enqueueSnackbar(t('common.config.error.export'), { variant: 'error' });
    throw error;
  } finally {
    set(handleLoadingEndAtom);
  }
});
