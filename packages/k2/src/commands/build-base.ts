import { type Configuration } from 'webpack';
import { buildWithWebpack } from '../lib/webpack.js';

export default async function action(params: { entries: Configuration['entry']; outDir: string }) {
  const { entries, outDir } = params;
  return buildWithWebpack({ entries, outDir });
}
