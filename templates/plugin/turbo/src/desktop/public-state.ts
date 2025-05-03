import { isUsagePluginConditionMet, restorePluginConfig } from '@/lib/plugin';
import { atom } from 'jotai';

export const pluginConfigAtom = atom(restorePluginConfig());
export const pluginConditionsAtom = atom((get) => get(pluginConfigAtom).conditions);
export const validPluginConditionsAtom = atom((get) =>
  get(pluginConditionsAtom).filter(isUsagePluginConditionMet)
);
