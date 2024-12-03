import { manager } from '@/lib/event-manager';
import { isProd } from '@/lib/global';
import { ComponentManager } from '@konomi-app/kintone-utilities-react';
import { nanoid } from 'nanoid';
import App from './app';

const ROOT_ID = nanoid();

manager.add(
  [
    'app.record.index.show',
    'app.record.detail.show',
    'app.record.create.show',
    'app.record.edit.show',
  ],
  (event) => {
    if (isProd) {
      return event;
    }
    ComponentManager.getInstance().renderComponent({ id: ROOT_ID, component: <App /> });
    return event;
  }
);
