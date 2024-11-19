import { KintoneEventManager } from '@konomi-app/kintone-utilities';

export const manager = new KintoneEventManager({
  logPrefix: '[k2 app] Event listener',
});
