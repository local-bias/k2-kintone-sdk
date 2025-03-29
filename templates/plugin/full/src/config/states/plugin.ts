import { PLUGIN_NAME } from '@/lib/constants';
import { t } from '@/lib/i18n';
import { migrateConfig, restorePluginConfig } from '@/lib/plugin';
import { PluginCommonConfig, PluginCondition, PluginConfig } from '@/schema/plugin-config';
import { onFileLoad, storePluginConfig } from '@konomi-app/kintone-utilities';
import { produce } from 'immer';
import { atom, SetStateAction } from 'jotai';
import { atomWithReset } from 'jotai/utils';
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, ReactNode } from 'react';
import invariant from 'tiny-invariant';
import { loadingEndAtom, loadingStartAtom } from './ui';

export const pluginConfigAtom = atom<PluginConfig>(restorePluginConfig());

// 📦 optics-tsを使用した際にwebpackの型推論が機能しない場合があるため、一時的に代替する関数を使用
// export const pluginConditionsAtom = focusAtom(pluginConfigAtom, (s) => s.prop('conditions'));
export const pluginConditionsAtom = atom(
  (get) => get(pluginConfigAtom).conditions,
  (_, set, newValue: SetStateAction<PluginCondition[]>) => {
    set(pluginConfigAtom, (current) =>
      produce(current, (draft) => {
        draft.conditions = typeof newValue === 'function' ? newValue(draft.conditions) : newValue;
      })
    );
  }
);
export const conditionsLengthAtom = atom((get) => get(pluginConditionsAtom).length);

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

export const selectedConditionIdAtom = atomWithReset<string | null>(null);
export const commonSettingsShownAtom = atom((get) => get(selectedConditionIdAtom) === null);

export const selectedConditionAtom = atom(
  (get) => {
    const conditions = get(pluginConditionsAtom);
    const selectedConditionId = get(selectedConditionIdAtom);
    return conditions.find((condition) => condition.id === selectedConditionId) ?? conditions[0]!;
  },
  (get, set, newValue: SetStateAction<PluginCondition>) => {
    const selectedConditionId = get(selectedConditionIdAtom);
    set(pluginConditionsAtom, (current) =>
      produce(current, (draft) => {
        const index = draft.findIndex((condition) => condition.id === selectedConditionId);
        if (index !== -1) {
          draft[index] = typeof newValue === 'function' ? newValue(draft[index]!) : newValue;
        }
      })
    );
  }
);

// 📦 optics-tsを使用した際にwebpackの型推論が機能しない場合があるため、一時的に代替する関数を使用
// export const getCommonPropertyAtom = <T extends keyof PluginCommonConfig>(property: T) =>
//   focusAtom(commonConfigAtom, (s) => s.prop(property)) as PrimitiveAtom<PluginCommonConfig[T]>;
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

// 📦 optics-tsを使用した際にwebpackの型推論が機能しない場合があるため、一時的に代替する関数を使用
// export const getConditionPropertyAtom = <T extends keyof PluginCondition>(property: T) =>
//   focusAtom(selectedConditionAtom, (s) => s.prop(property)) as PrimitiveAtom<PluginCondition[T]>;
export const getConditionPropertyAtom = <T extends keyof PluginCondition>(property: T) =>
  atom(
    (get) => {
      return get(selectedConditionAtom)[property];
    },
    (_, set, newValue: SetStateAction<PluginCondition[T]>) => {
      set(selectedConditionAtom, (condition) =>
        produce(condition, (draft) => {
          draft[property] = typeof newValue === 'function' ? newValue(draft[property]) : newValue;
        })
      );
    }
  );

export const updatePluginConfig = atom(null, (get, set, actionComponent: ReactNode) => {
  try {
    set(loadingStartAtom);
    const pluginConfig = get(pluginConfigAtom);
    storePluginConfig(pluginConfig, {
      callback: () => true,
      flatProperties: ['conditions'],
      debug: true,
    });
    enqueueSnackbar(t('config.toast.save'), {
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
      enqueueSnackbar(t('config.toast.import'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('config.error.import'), { variant: 'error' });
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
    enqueueSnackbar(t('config.toast.export'), { variant: 'success' });
  } catch (error) {
    enqueueSnackbar(t('config.error.export'), { variant: 'error' });
    throw error;
  } finally {
    set(loadingEndAtom);
  }
});
