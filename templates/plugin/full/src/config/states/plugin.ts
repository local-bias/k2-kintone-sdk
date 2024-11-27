import {
  PluginCommonConfig,
  PluginCondition,
  PluginConfig,
  restorePluginConfig,
} from '@/lib/plugin';
import { produce } from 'immer';
import { atom, PrimitiveAtom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { atomWithReset } from 'jotai/utils';

export const pluginConfigAtom = atom<PluginConfig>(restorePluginConfig());
export const loadingAtom = atom(false);
export const conditionsAtom = focusAtom(pluginConfigAtom, (s) => s.prop('conditions'));
export const conditionsLengthAtom = focusAtom(conditionsAtom, (s) => s.prop('length'));
export const commonConfigAtom = focusAtom(pluginConfigAtom, (s) => s.prop('common'));
export const selectedConditionIdAtom = atomWithReset<string | null>(null);
export const commonSettingsShownAtom = atom((get) => get(selectedConditionIdAtom) === null);
export const selectedConditionAtom = atom(
  (get) => {
    const conditions = get(conditionsAtom);
    const selectedConditionId = get(selectedConditionIdAtom);
    return conditions.find((condition) => condition.id === selectedConditionId) ?? conditions[0]!;
  },
  (get, set, newValue: PluginCondition) => {
    const selectedConditionId = get(selectedConditionIdAtom);
    set(conditionsAtom, (current) =>
      produce(current, (draft) => {
        const index = draft.findIndex((condition) => condition.id === selectedConditionId);
        if (index !== -1) {
          draft[index] = newValue;
        }
      })
    );
  }
);

export const getCommonPropertyAtom = <T extends keyof PluginCommonConfig>(property: T) =>
  focusAtom(commonConfigAtom, (s) => s.prop(property)) as PrimitiveAtom<PluginCommonConfig[T]>;

export const getConditionPropertyAtom = <T extends keyof PluginCondition>(property: T) =>
  focusAtom(selectedConditionAtom, (s) => s.prop(property)) as PrimitiveAtom<PluginCondition[T]>;
