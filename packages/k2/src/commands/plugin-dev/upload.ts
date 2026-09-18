import chokidar from 'chokidar';
import { logEvent, logEventFailure } from '../../lib/log-format.js';
import { copyPluginContents } from '../../lib/plugin-contents.js';
import { buildAndUploadPlugin } from '../../lib/utils.js';

/** 監視対象のコンテンツディレクトリ */
const CONTENTS_WATCH_PATH = 'src/contents';

export const watchContentsAndUploadZip = async (params: {
  manifest: Plugin.Meta.Manifest;
  ppkPath: string;
}) => {
  const { manifest, ppkPath } = params;

  // 初期スキャン中のイベントごとにアップロードしないよう、readyまで処理を抑制します
  let initialScanComplete = false;

  const contentsListener = async () => {
    if (!initialScanComplete) {
      return;
    }

    try {
      await copyPluginContents();
      logEvent('contents', 'updated');
    } catch (error) {
      logEventFailure('contents', error);
      return;
    }

    try {
      const { method } = await buildAndUploadPlugin({ env: 'dev', manifest, ppkPath });
      logEvent('upload', `uploaded ${method === 'POST' ? '(new)' : '(update)'}`);
    } catch (error) {
      logEventFailure('upload', error);
    }
  };

  const contentsWatcher = chokidar.watch(CONTENTS_WATCH_PATH, {
    ignored: (filePath) => filePath.includes('node_modules'),
    persistent: true,
  });

  contentsWatcher.on('ready', () => {
    initialScanComplete = true;
    void contentsListener();
  });

  contentsWatcher.on('all', (event) => {
    if (event === 'add' || event === 'change' || event === 'unlink') {
      void contentsListener();
    }
  });

  return contentsWatcher;
};
