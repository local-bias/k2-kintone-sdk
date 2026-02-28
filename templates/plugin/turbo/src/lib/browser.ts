import { createKetch } from '@konomi-app/ketch';
import { isDev, PLUGIN_ID } from './global';

export const ketch = createKetch({
  pluginId: PLUGIN_ID,
  debug: isDev,
});
