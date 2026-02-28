import { isConditionIdUnselectedAtom, getConditionPropertyAtom } from '@/config/states/plugin';
import { JotaiSwitch, JotaiText } from '@konomi-app/kintone-utilities-jotai';
import {
  PluginFormDescription,
  PluginFormSection,
  PluginFormTitle,
} from '@konomi-app/kintone-utilities-react';
import { useAtomValue } from 'jotai';

import CommonSettings from './common';
import DeleteButton from './condition-delete-button';
import FieldsForm from './form-fields';

function FormContent() {
  return (
    <div className='p-4'>
      <PluginFormSection>
        <PluginFormTitle></PluginFormTitle>
        <PluginFormDescription last></PluginFormDescription>
        <JotaiText atom={getConditionPropertyAtom('memo')} />
      </PluginFormSection>
      <PluginFormSection>
        <PluginFormTitle></PluginFormTitle>
        <PluginFormDescription last></PluginFormDescription>
        <FieldsForm />
      </PluginFormSection>
      <PluginFormSection>
        <PluginFormTitle></PluginFormTitle>
        <PluginFormDescription last></PluginFormDescription>
        <JotaiSwitch atom={getConditionPropertyAtom('isSampleUIShown')} />
      </PluginFormSection>
      <DeleteButton />
    </div>
  );
}

function PluginForm() {
  const commonSettingsShown = useAtomValue(isConditionIdUnselectedAtom);
  return commonSettingsShown ? <CommonSettings /> : <FormContent />;
}

export default PluginForm;
