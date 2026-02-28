import { PluginCondition } from '@/schema/plugin-config';
import { css } from '@emotion/css';
import { Fab } from '@mui/material';
import { store } from '@repo/jotai';
import { cn } from '@repo/utils';
import JsonView from '@uiw/react-json-view';
import { Provider, useAtomValue } from 'jotai';
import { useState, type FC } from 'react';
import { pluginConfigAtom } from '../public-state';

function Condition({ condition }: { condition: PluginCondition }) {
  return (
    <div>
      <details>
        <summary>
          <div className='text-sm text-gray-800 font-bold'>{condition.id}</div>
        </summary>
        <JsonView value={{ ...condition }} />
      </details>
    </div>
  );
}

function DebugContent() {
  const pluginConfig = useAtomValue(pluginConfigAtom);
  return (
    <div>
      {pluginConfig.conditions.map((condition) => (
        <Condition key={condition.id} condition={condition} />
      ))}
    </div>
  );
}

function DebugApp() {
  const [shown, setShown] = useState(false);

  const onButtonClick = () => {
    setShown((prev) => !prev);
  };

  return (
    <Provider store={store}>
      <div className='🐸'>
        <div
          className={cn(
            'transition-all opacity-100 fixed right-0 top-0 z-40 bg-white/60 backdrop-blur-sm text-gray-800 p-4 overflow-auto h-screen',
            {
              'opacity-0 pointer-events-none': !shown,
            },
            css`
              --w-rjv-background-color: transparent;
            `
          )}
        >
          <div className='box-border p-4 overflow-auto'>
            <div className='mb-4 text-sm text-green-800 font-bold'>
              Plugin Debug Menu
              <span className='text-xs'>(Not displayed in production)</span>
            </div>
            <DebugContent />
          </div>
        </div>
        <Fab
          onClick={onButtonClick}
          color='warning'
          size='small'
          className='fixed right-3 bottom-3 z-50'
        >
          🐛
        </Fab>
      </div>
    </Provider>
  );
}

export default DebugApp;
