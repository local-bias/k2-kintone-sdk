import { KintoneEventManager } from '@konomi-app/kintone-utilities';

const manager = new KintoneEventManager();

manager.add(['app.record.index.show'], (event) => {
  console.log('app.record.index.show', event);
  return event;
});
