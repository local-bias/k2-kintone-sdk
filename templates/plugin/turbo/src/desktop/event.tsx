import { manager } from '@/lib/event-manager';
import { store } from '@repo/jotai';
import { pluginConfigAtom } from './public-state';

manager.add(['app.record.index.show', 'app.record.detail.show'], async (event) => {
  const config = store.get(pluginConfigAtom);

  console.log('config', config);

  return event;
});
