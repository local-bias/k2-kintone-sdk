import { manager } from '@/lib/event-listener';

manager.add(['app.record.index.show'], (event) => {
  console.log('app 2 event listener');
  return event;
});
