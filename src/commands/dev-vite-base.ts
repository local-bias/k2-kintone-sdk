import { createServer, build, InlineConfig } from 'vite';
import chokidar from 'chokidar';
import { PLUGIN_DEVELOPMENT_DIRECTORY } from '../lib/constants.js';

export default async function action(params: { viteConfig: InlineConfig }) {
  console.group('🚀 Start development server');
  try {
    const { viteConfig } = params;

    const watcher = chokidar.watch(['src/**/*.{ts,js,jsx,tsx}'], {
      ignored: /node_modules/,
      persistent: true,
    });

    const listener = async () => build(viteConfig);

    await listener();

    watcher.on('change', listener);
    watcher.on('add', listener);
    watcher.on('unlink', listener);

    const server = await createServer({
      ...viteConfig,
      root: PLUGIN_DEVELOPMENT_DIRECTORY,
    });
    await server.listen();

    server.printUrls();
  } catch (error) {
    throw error;
  } finally {
    console.groupEnd();
  }
}
