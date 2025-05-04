import { isConditionIdUnselectedAtom, getConditionPropertyAtom } from '@/config/states/plugin';
import { JotaiSwitch, JotaiText } from '@konomi-app/kintone-utilities-jotai';
import {
  PluginFormDescription,
  PluginFormSection,
  PluginFormTitle,
} from '@konomi-app/kintone-utilities-react';
import { useAtomValue } from 'jotai';
import { FC } from 'react';
import CommonSettings from './common';
import DeleteButton from './condition-delete-button';
import FieldsForm from './form-fields';

const FormContent: FC = () => {
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
};

const FormContainer: FC = () => {
  const commonSettingsShown = useAtomValue(isConditionIdUnselectedAtom);
  return commonSettingsShown ? <CommonSettings /> : <FormContent />;
};

export default FormContainer;
