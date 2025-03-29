import { PluginConditionDeleteButton } from '@konomi-app/kintone-utilities-react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  handlePluginConditionDeleteAtom,
  isConditionDeleteButtonShownAtom,
} from '../../../states/plugin';

function ConditionDeleteButtonContent() {
  const onClick = useSetAtom(handlePluginConditionDeleteAtom);
  return <PluginConditionDeleteButton {...{ onClick }} />;
}

export default function ConditionDeleteButton() {
  const isShown = useAtomValue(isConditionDeleteButtonShownAtom);
  return isShown ? <ConditionDeleteButtonContent /> : null;
}
