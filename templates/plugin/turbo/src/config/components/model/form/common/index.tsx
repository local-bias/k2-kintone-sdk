import { getCommonPropertyAtom } from '@/config/states/plugin';
import { JotaiText } from '@konomi-app/kintone-utilities-jotai';
import {
  PluginFormDescription,
  PluginFormSection,
  PluginFormTitle,
} from '@konomi-app/kintone-utilities-react';
import { FC } from 'react';

const Component: FC = () => (
  <div className='p-4'>
    <PluginFormSection>
      <PluginFormTitle></PluginFormTitle>
      <PluginFormDescription last></PluginFormDescription>
      <JotaiText atom={getCommonPropertyAtom('memo')} label={'$'} placeholder={'#'} />
    </PluginFormSection>
  </div>
);

export default Component;
