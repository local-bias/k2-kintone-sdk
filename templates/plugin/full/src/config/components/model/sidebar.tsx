import { conditionsAtom, selectedConditionIdAtom } from '@/config/states/plugin';
import { t } from '@/lib/i18n';
import { getNewCondition, validatePluginCondition } from '@/lib/plugin';
import { BundledSidebar } from '@konomi-app/kintone-utilities-react';
import { useAtom } from 'jotai';
import { useSnackbar } from 'notistack';
import { FC, useCallback } from 'react';

const Sidebar: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [conditions, setConditions] = useAtom(conditionsAtom);
  const [selectedConditionId, setSelectedConditionId] = useAtom(selectedConditionIdAtom);
  const label = useCallback((params: { condition: Plugin.Condition; index: number }) => {
    const { condition, index } = params;
    return (
      <div>
        <div className='text-[11px] text-gray-400'>{`${t('config.sidebar.tab.label')}${index + 1}`}</div>
        <div>{condition.memo || '未設定'}</div>
      </div>
    );
  }, []);

  const onSelectedConditionChange = (condition: Plugin.Condition | null) => {
    setSelectedConditionId(condition?.id ?? null);
  };

  const onConditionDelete = () => {
    enqueueSnackbar('設定情報を削除しました', { variant: 'success' });
  };

  return (
    <BundledSidebar
      conditions={conditions}
      // @ts-ignore
      setConditions={setConditions}
      getNewCondition={getNewCondition}
      labelComponent={label}
      onSelectedConditionChange={onSelectedConditionChange}
      selectedConditionId={selectedConditionId}
      commonTab
      onConditionDelete={onConditionDelete}
      context={{
        onCopy: () => {
          console.log('copied');
          enqueueSnackbar('設定情報をコピーしました', { variant: 'success' });
        },
        onPaste: () => {
          enqueueSnackbar('設定情報を貼り付けました', { variant: 'success' });
          return null;
        },
        onPasteValidation: (condition) => {
          try {
            validatePluginCondition(condition);
          } catch (error) {
            return false;
          }
          return true;
        },
        onPasteValidationError: () => {
          enqueueSnackbar('設定情報の形式が正しくありません', { variant: 'error' });
        },
      }}
    />
  );
};

export default Sidebar;
