import { PluginConditionDeleteButton } from '@konomi-app/kintone-utilities-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { handlePluginConditionDeleteAtom, hasMultipleConditionsAtom } from '../../../states/plugin';

function ConditionDeleteButtonContent() {
  const onClick = useSetAtom(handlePluginConditionDeleteAtom);
  return <PluginConditionDeleteButton {...{ onClick }} />;
}

export default function ConditionDeleteButton() {
  const isShown = useAtomValue(hasMultipleConditionsAtom);
  return isShown ? <ConditionDeleteButtonContent /> : null;
}
