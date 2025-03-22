import { restorePluginConfig } from '@/lib/plugin';
import { PluginCommonConfig, PluginCondition, PluginConfig } from '@/schema/plugin-config';
import { produce } from 'immer';
import { atom, SetStateAction } from 'jotai';
import { atomWithReset } from 'jotai/utils';

export const pluginConfigAtom = atom<PluginConfig>(restorePluginConfig());
export const loadingAtom = atom(false);

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
