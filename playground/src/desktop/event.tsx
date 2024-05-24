import { KintoneEventManager } from '@konomi-app/kintone-utilities';
import config from 'plugin.config.mjs';
import React from 'react';
import { Root, createRoot } from 'react-dom/client';

const ROOT_ID = `🐸${config.id}-root`;

let cachedRoot: Root | null = null;

const manager = new KintoneEventManager();

manager.add(['app.record.index.show'], async (event) => {
  if (!cachedRoot || !document.getElementById(ROOT_ID)) {
    const rootElement = document.createElement('div');
    rootElement.id = ROOT_ID;
    document.body.append(rootElement);

    const root = createRoot(rootElement);

    cachedRoot = root;
  }

  cachedRoot.render(<div>{JSON.stringify({}, null, 2)}</div>);

  return event;
});
