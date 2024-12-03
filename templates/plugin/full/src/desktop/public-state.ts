import { isUsagePluginConditionMet, restorePluginConfig } from '@/lib/plugin';
import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';

export const pluginConfigAtom = atom(restorePluginConfig());
export const pluginConditionsAtom = focusAtom(pluginConfigAtom, (s) => s.prop('conditions'));
export const validPluginConditionsAtom = atom((get) =>
  get(pluginConditionsAtom).filter(isUsagePluginConditionMet)
);
