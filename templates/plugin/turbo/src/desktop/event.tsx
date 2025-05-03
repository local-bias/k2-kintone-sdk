import { manager } from '@/lib/event-manager';
import { restorePluginConfig } from '@/lib/plugin';
// import config from 'plugin.config.mjs';

// const ROOT_ID = `🐸${config.id}-root`;

manager.add(['app.record.index.show', 'app.record.detail.show'], async (event) => {
  const config = restorePluginConfig();

  console.log('config', config);

  return event;
});
