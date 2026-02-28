import { pluginConditionsAtom, selectedConditionIdAtom } from '@/config/states/plugin';
import { t } from '@/lib/i18n';
import { getNewCondition, isPluginConditionMet } from '@/lib/plugin';
import { PluginCondition } from '@/schema/plugin-config';
import { BundledSidebar } from '@konomi-app/kintone-utilities-react';
import { useAtom } from 'jotai';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

function Sidebar() {
  const { enqueueSnackbar } = useSnackbar();
  const [conditions, setConditions] = useAtom(pluginConditionsAtom);
  const [selectedConditionId, setSelectedConditionId] = useAtom(selectedConditionIdAtom);
  const label = useCallback((params: { condition: PluginCondition; index: number }) => {
    const { condition, index } = params;
    return (
      <div>
        <div className='text-[11px] leading-4 text-gray-400'>{`${t('common.config.sidebar.tab.label')}${index + 1}`}</div>
        <div>{condition.memo || t('common.config.sidebar.tab.defaultLabel')}</div>
      </div>
    );
  }, []);

  const onSelectedConditionChange = (condition: PluginCondition | null) => {
    setSelectedConditionId(condition?.id ?? null);
  };

  const onConditionDelete = () => {
    enqueueSnackbar(t('common.config.toast.onConditionDelete'), { variant: 'success' });
  };

  return (
    <BundledSidebar
      conditions={conditions}
      setConditions={setConditions}
      getNewCondition={getNewCondition}
      labelComponent={label}
      onSelectedConditionChange={onSelectedConditionChange}
      selectedConditionId={selectedConditionId}
      commonTab
      onConditionDelete={onConditionDelete}
      context={{
        onCopy: () => {
          enqueueSnackbar(t('common.config.sidebar.context.onCopy'), { variant: 'success' });
        },
        onPaste: () => {
          enqueueSnackbar(t('common.config.sidebar.context.onPaste'), { variant: 'success' });
          return null;
        },
        onPasteValidation: (condition) => isPluginConditionMet(condition),
        onPasteValidationError: () => {
          enqueueSnackbar(t('common.config.sidebar.context.onPasteFailure'), { variant: 'error' });
        },
      }}
    />
  );
}

export default Sidebar;
