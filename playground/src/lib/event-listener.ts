import { KintoneEventManager } from '@konomi-app/kintone-utilities';

export const manager = new KintoneEventManager({
  logPrefix: '[plugin] Event listener',
});
