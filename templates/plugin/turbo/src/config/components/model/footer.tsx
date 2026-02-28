import {
  exportPluginConfigAtom,
  handlePluginConfigResetAtom,
  importPluginConfigAtom,
  updatePluginConfig,
} from '@/config/states/plugin';
import { t } from '@/lib/i18n';
import {
  PluginConfigExportButton,
  PluginConfigImportButton,
  PluginConfigResetButton,
  PluginFooter,
} from '@konomi-app/kintone-utilities-react';
import SaveIcon from '@mui/icons-material/Save';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Button, CircularProgress } from '@mui/material';
import { loadingAtom } from '@repo/jotai';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

interface Props {
  backToPluginList: () => void;
}

function ConfigResetButton() {
  const reset = useSetAtom(handlePluginConfigResetAtom);
  return <PluginConfigResetButton reset={reset} />;
}

function ConfigExportButton() {
  const loading = useAtomValue(loadingAtom);
  const exportPluginConfig = useSetAtom(exportPluginConfigAtom);
  return <PluginConfigExportButton loading={loading} onExportButtonClick={exportPluginConfig} />;
}

function ConfigImportButton() {
  const loading = useAtomValue(loadingAtom);
  const importPluginConfig = useSetAtom(importPluginConfigAtom);
  return <PluginConfigImportButton loading={loading} onImportButtonClick={importPluginConfig} />;
}

function SaveButton({ backToPluginList }: Pick<Props, 'backToPluginList'>) {
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
            {t('common.config.button.return')}
          </Button>
        )
      }
      startIcon={loading ? <CircularProgress color='inherit' size={20} /> : <SaveIcon />}
    >
      {t('common.config.button.save')}
    </Button>
  );
}

function BackToPluginListButton({ backToPluginList }: Pick<Props, 'backToPluginList'>) {
  const loading = useAtomValue(loadingAtom);
  return (
    <Button
      variant='contained'
      color='inherit'
      disabled={loading}
      onClick={backToPluginList}
      startIcon={
        loading ? <CircularProgress color='inherit' size={20} /> : <SettingsBackupRestoreIcon />
      }
    >
      {t('common.config.button.return')}
    </Button>
  );
}

export default function Footer() {
  const backToPluginList = useCallback(() => history.back(), []);

  return (
    <PluginFooter className='py-2'>
      <div className='flex items-center gap-4'>
        <SaveButton backToPluginList={backToPluginList} />
        <BackToPluginListButton backToPluginList={backToPluginList} />
      </div>
      <div className='flex items-center gap-4'>
        <ConfigExportButton />
        <ConfigImportButton />
        <ConfigResetButton />
      </div>
    </PluginFooter>
  );
}
