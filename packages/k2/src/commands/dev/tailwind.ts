import fs from 'fs-extra';
import path from 'node:path';
import { logEvent } from '../../lib/log-format.js';
import { watchTailwindCSS } from '../../lib/tailwind.js';

const OUTPUT_FILE_NAME = 'tailwind.css';

export const watchCss = async (params: { k2Config: K2.Config; outdir: string }) => {
  const { k2Config, outdir } = params;
  if (!k2Config.tailwind?.css) {
    console.log('🚫 missing tailwind css config. Skip watching css.');
    return;
  }

  const output = path.join(outdir, k2Config.tailwind.fileName ?? OUTPUT_FILE_NAME);

  // 初回コンパイル前でも開発サーバーが404を返さないよう、空ファイルを用意しておきます
  if (!(await fs.pathExists(output))) {
    await fs.outputFile(output, '');
  }

  return watchTailwindCSS({
    input: path.resolve(k2Config.tailwind.css),
    output,
    onChanges: ({ output, type }) => {
      logEvent(
        'css',
        `${path.basename(output)}${type === 'init' ? ' init' : ` rebuilt(${type})`}`
      );
    },
  });
};
