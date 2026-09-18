import path from 'node:path';
import { PLUGIN_DEVELOPMENT_DIRECTORY } from '../../lib/constants.js';
import { logEvent } from '../../lib/log-format.js';
import { getTailwindInputCss, watchTailwindCSS } from '../../lib/tailwind.js';

function watchOne(params: { inputFile: string; outputFileName: string }) {
  const { inputFile, outputFileName } = params;

  return watchTailwindCSS({
    input: path.resolve(inputFile),
    output: path.join(PLUGIN_DEVELOPMENT_DIRECTORY, outputFileName),
    onChanges: ({ output, type }) => {
      logEvent('css', `${path.basename(output)}${type === 'init' ? ' init' : ' rebuilt'}`);
    },
  });
}

export const watchCss = async (pluginConfig: Plugin.Meta.Config) => {
  if (!pluginConfig.tailwind?.css) {
    return;
  }

  const inputFile = getTailwindInputCss(pluginConfig.tailwind);

  return Promise.all([
    watchOne({ inputFile: inputFile.desktop, outputFileName: 'desktop.css' }),
    watchOne({ inputFile: inputFile.config, outputFileName: 'config.css' }),
  ]);
};
