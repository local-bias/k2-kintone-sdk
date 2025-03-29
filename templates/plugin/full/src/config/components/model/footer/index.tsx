import { t } from '@/lib/i18n';
import {
  PluginConfigExportButton,
  PluginConfigImportButton,
  PluginFooter,
} from '@konomi-app/kintone-utilities-react';
import SaveIcon from '@mui/icons-material/Save';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Button, CircularProgress } from '@mui/material';
import { useAtomValue, useSetAtom } from 'jotai';
import { FC, useCallback } from 'react';
import {
  exportPluginConfigAtom,
  importPluginConfigAtom,
  loadingAtom,
  updatePluginConfig,
} from '../../../states/plugin';
import ResetButton from './reset-button';

type Props = {
  backToPluginList: () => void;
};

const SaveButton: FC<Pick<Props, 'backToPluginList'>> = ({ backToPluginList }) => {
  const loading = useAtomValue(loadingAtom);
  const savePluginConfig = useSetAtom(updatePluginConfig);

  return (
    <Button
      variant='contained'
      color='primary'
      disabled={loading}
      onClick={() =>
        savePluginConfig(
          <Button color='inherit' size='small' variant='outlined' onClick={backToPluginList}>
            {t('config.button.return')}
          </Button>
        )
      }
      startIcon={loading ? <CircularProgress color='inherit' size={20} /> : <SaveIcon />}
    >
      {t('config.button.save')}
    </Button>
  );
};

const Component: FC<Props> = ({ backToPluginList }) => {
  const loading = useAtomValue(loadingAtom);
  const importPluginConfig = useSetAtom(importPluginConfigAtom);
  const exportPluginConfig = useSetAtom(exportPluginConfigAtom);

  return (
    <>
      <div className='flex items-center gap-4'>
        <SaveButton backToPluginList={backToPluginList} />
        <Button
          variant='contained'
          color='inherit'
          disabled={loading}
          onClick={backToPluginList}
          startIcon={
            loading ? <CircularProgress color='inherit' size={20} /> : <SettingsBackupRestoreIcon />
          }
        >
          {t('config.button.return')}
        </Button>
      </div>
      <div className='flex items-center gap-4'>
        <PluginConfigExportButton loading={loading} onExportButtonClick={exportPluginConfig} />
        <PluginConfigImportButton loading={loading} onImportButtonClick={importPluginConfig} />
        <ResetButton />
      </div>
    </>
  );
};

const Footer: FC = () => {
  const backToPluginList = useCallback(() => history.back(), []);

  return (
    <PluginFooter className='py-2'>
      <Component {...{ backToPluginList }} />
    </PluginFooter>
  );
};

export default Footer;
