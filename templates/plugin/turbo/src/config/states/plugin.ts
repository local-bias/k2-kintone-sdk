import { PLUGIN_NAME } from '@/lib/constants';
import { t } from '@/lib/i18n';
import { createConfig, migrateConfig, restorePluginConfig } from '@/lib/plugin';
import { PluginCommonConfig, PluginConfig } from '@/schema/plugin-config';
import { onFileLoad, storePluginConfig } from '@konomi-app/kintone-utilities';
import { usePluginAtoms } from '@repo/jotai';
import { produce } from 'immer';
import { atom, SetStateAction } from 'jotai';
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, ReactNode } from 'react';
import invariant from 'tiny-invariant';
import { loadingEndAtom, loadingStartAtom } from './ui';

export const pluginConfigAtom = atom<PluginConfig>(restorePluginConfig());

export const handlePluginConfigResetAtom = atom(null, (_, set) => {
  set(pluginConfigAtom, createConfig());
  enqueueSnackbar(t('common.config.toast.reset'), { variant: 'success' });
});

export const {
  pluginConditionsAtom,
  conditionsLengthAtom,
  selectedConditionIdAtom,
  selectedConditionAtom,
  getConditionPropertyAtom,
} = usePluginAtoms(pluginConfigAtom, {
  enableCommonCondition: true,
});

// 📦 optics-tsを使用した際にwebpackの型推論が機能しない場合があるため、一時的に代替する関数を使用
// export const commonConfigAtom = focusAtom(pluginConfigAtom, (s) => s.prop('common'));
export const commonConfigAtom = atom(
  (get) => get(pluginConfigAtom).common,
  (_, set, newValue: SetStateAction<PluginCommonConfig>) => {
    set(pluginConfigAtom, (current) =>
      produce(current, (draft) => {
        draft.common = typeof newValue === 'function' ? newValue(draft.common) : newValue;
      })
    );
  }
);

export const commonSettingsShownAtom = atom((get) => get(selectedConditionIdAtom) === null);

export const isConditionDeleteButtonShownAtom = atom((get) => {
  const conditions = get(pluginConditionsAtom);
  return conditions.length > 1;
});

export const getCommonPropertyAtom = <T extends keyof PluginCommonConfig>(property: T) =>
  atom(
    (get) => {
      return get(commonConfigAtom)[property];
    },
    (_, set, newValue: SetStateAction<PluginCommonConfig[T]>) => {
      set(commonConfigAtom, (common) =>
        produce(common, (draft) => {
          draft[property] = typeof newValue === 'function' ? newValue(draft[property]) : newValue;
        })
      );
    }
  );

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
    set(loadingStartAtom);
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
    set(loadingEndAtom);
  }
});

/**
 * jsonファイルを読み込み、プラグインの設定情報をインポートします
 */
export const importPluginConfigAtom = atom(
  null,
  async (_, set, event: ChangeEvent<HTMLInputElement>) => {
    try {
      set(loadingStartAtom);
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
      set(loadingEndAtom);
    }
  }
);

/**
 * プラグインの設定情報をjsonファイルとしてエクスポートします
 */
export const exportPluginConfigAtom = atom(null, (get, set) => {
  try {
    set(loadingStartAtom);
    const pluginConfig = get(pluginConfigAtom);
    const blob = new Blob([JSON.stringify(pluginConfig, null)], {
      type: 'application/json',
    });
    const url = (window.URL || window.webkitURL).createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${PLUGIN_NAME}-config.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    enqueueSnackbar(t('common.config.toast.export'), { variant: 'success' });
  } catch (error) {
    enqueueSnackbar(t('common.config.error.export'), { variant: 'error' });
    throw error;
  } finally {
    set(loadingEndAtom);
  }
});
